import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../hooks/tokenStorage';

interface Participant {
    _id: string;
    name: string;
    checked: boolean;
    status: string;
}

interface Course {
    _id: string;
    title: string;
    date: string;
    status: string;
    image: string;
}

interface CheckNameProps {
    course: Course;
}

const CheckName: React.FC<CheckNameProps> = ({ course }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                setLoading(true);
                const token = getToken();
                if (!token) {
                    setError('ไม่พบ Token กรุณาเข้าสู่ระบบใหม่');
                    setLoading(false);
                    return;
                }
                
                const response = await axios.get(`http://localhost:3000/api/Admin/Check/participants/${course._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setParticipants(response.data.map((p: any) => ({ ...p, checked: p.status === 'completed' })));
            } catch (error) {
                console.error("Error fetching participants:", error);
                setError('An unexpected error occurred while fetching participants.');
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [course._id]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleCheck = (index: number) => {
        const newParticipants = [...participants];
        newParticipants[index].checked = !newParticipants[index].checked;
        setParticipants(newParticipants);
    };

    const filteredParticipants = participants.filter(participant =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const checkedCount = filteredParticipants.filter(p => p.checked).length;

    const handleSave = async () => {
        const checkedParticipants = filteredParticipants
            .filter(participant => participant.checked)
            .map(participant => ({
                participantId: participant._id,
                status: "completed",
            }));
    
        console.log('Checked Participants:', checkedParticipants);
        console.log('Course ID:', course._id);

        // ตรวจสอบข้อมูลก่อนส่ง API
        if (!course._id) {
            setError('ไม่พบรหัสคอร์ส กรุณาลองใหม่อีกครั้ง');
            return;
        }

        if (checkedParticipants.length === 0) {
            setError('กรุณาเลือกผู้เข้าร่วมอย่างน้อย 1 คน');
            return;
        }
    
        try {
            const token = getToken();
            if (!token) {
                setError('ไม่พบ Token กรุณาเข้าสู่ระบบใหม่');
                return;
            }
            
            // แสดง request payload เพื่อตรวจสอบข้อมูล
            const requestData = {
                participants: checkedParticipants,
                courseId: course._id,
            };
            console.log('Request payload:', requestData);
            
            const response = await axios.put(`http://localhost:3000/api/Admin/update/UserStatusCourse`, requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
    
            console.log('Update response:', response.data);

            // Update local state
            setParticipants(prevParticipants =>
                prevParticipants.map(participant => ({
                    ...participant,
                    status: participant.checked ? "completed" : participant.status,
                }))
            );

            alert("บันทึกสถานะและอัพเดทระยะเวลาพันธะเรียบร้อยแล้ว!");
        } catch (error: any) {
            console.error("Error updating participant status and bond status:", error.response?.data || error.message);
            setError(`An error occurred while saving: ${error.response?.data?.error || error.message}`);
        }
    };   

    if (loading) return <div className="text-center mt-10">Loading participants...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div id="check-name-container" className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
                <div id="check-icon" className="bg-yellow-200 rounded-full p-2">
                    <i className="fas fa-check text-yellow-500"></i>
                </div>
                <div className="ml-4">
                    <h1 id="check-title" className="text-xl font-bold">ตรวจสอบการเข้าอบรม</h1>
                    <p id="check-subtitle" className="text-gray-600">รายชื่อผู้สมัครเข้าอบรม</p>
                </div>
            </div>
            <p className="text-gray-600 mb-4">ชื่อคอร์สเรียน : <span id="course-title" className="font-bold">{course.title}</span></p>
            <input
                id="search-participant"
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={handleSearch}
                className="mb-4 p-2 border border-gray-300 rounded w-full"
            />
            <div id="participants-table-container" className="overflow-y-auto max-h-64">
                <table id="participants-table" className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="bg-gray-200 p-2">ชื่อ-นามสกุล</th>
                            <th className="bg-gray-200 p-2">เช็คการเข้าอบรม</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParticipants.map((participant, index) => (
                            <tr key={participant._id} className="border-t">
                                <td className="p-2 flex items-center">
                                    {participant.name}
                                </td>
                                <td className="p-2 text-center">
                                    <button 
                                        id={`check-participant-${participant._id}`}
                                        onClick={() => handleCheck(index)}
                                    >
                                        {participant.checked ? (
                                            <i className="fas fa-check-circle text-yellow-500"></i>
                                        ) : (
                                            <i className="far fa-circle text-yellow-500"></i>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <p className="font-bold">ยอดผู้เข้าร่วม <span id="participant-count" className="text-yellow-500">{checkedCount}</span> คน</p>
                <button 
                    id="save-participants"
                    onClick={handleSave} 
                    className="bg-yellow-500 text-white py-2 px-4 rounded-full"
                >
                    บันทึก
                </button>
            </div>
        </div>
    );
};

export default CheckName;