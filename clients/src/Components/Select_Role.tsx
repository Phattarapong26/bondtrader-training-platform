import React from 'react';
import styles from '../Styles/Select.module.css';
import { Link } from 'react-router-dom';

// Define a functional component using React.FC (Function Component)
const SelectRole: React.FC = () => {
    return (
        <div id="role-select-container" className={styles.Conk}>
            <div id="role-text-container" className={styles.TxtCOn}>
            </div>
            <div id="role-cards-container" className={styles.container}>
                <div id="medicine-card" className={styles.card}>
                    <span></span>
                    <div id="medicine-content" className={styles.content}>
                        <img
                            id="medicine-image"
                            src="https://raw.githubusercontent.com/Phattarapong26/image/2dc85cfdc4c702d93fd9a394db8d58a523af74de/undraw_programmer_re_owql.svg"
                            width="150px"
                            className={styles.image}
                            alt="Medicine"
                        />
                        <hr className={styles.hr} />
                        <Link to="/DashboardAD">
                            <button id="medicine-btn" className={styles.button1}>MEDICINE</button>
                        </Link>
                    </div>
                </div>

                <div id="admin-card" className={styles.cards}>
                    <span></span>
                    <div id="admin-content" className={styles.content}>
                        <img
                            id="admin-image"
                            src="https://raw.githubusercontent.com/Phattarapong26/image/3a8251ae8ac3a21060ac1594429a1dda389d1407/undraw_conversation_re_c26v.svg"
                            width="150px"
                            className={styles.image}
                            alt="Admin"
                        />
                        <hr className={styles.hr} />
                        <Link to="/DashboardAD">
                            <button id="admin-btn" className={styles.button2}>ADMIN MD</button>
                        </Link>
                    </div>
                </div>
            </div>
            <div id="report-section" className={styles.Rport}>
                <h3>แจ้งปัญหาการใช้งาน</h3>
            </div>
        </div>
    );
};

export default SelectRole;
