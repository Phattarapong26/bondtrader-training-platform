import { Request, Response } from "express";

const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};
export const formatDate = (req: Request, res: Response) => {
  const { dateString } = req.body;

  if (!dateString || dateString === "null") {
    return res.json({ formattedDate: "ยังไม่ได้รับสถานะ" });
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return res.json({ formattedDate: "วันที่ไม่ถูกต้อง" });
    }
    const formattedDate = new Intl.DateTimeFormat("th-TH", options).format(
      date
    );
    res.json({ formattedDate });
  } catch (error) {
    res.json({ formattedDate: "วันที่ไม่ถูกต้อง" });
  }
};

export const calculateAge = (req: Request, res: Response) => {
  const { startDate } = req.body;

  if (!startDate || startDate === "null") {
    return res.json({ age: "ยังไม่ได้รับสถานะ" });
  }

  try {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.json({ age: "วันที่ไม่ถูกต้อง" });
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    res.json({ age: `${years} ปี ${months} เดือน ${days} วัน` });
  } catch (error) {
    res.json({ age: "ยังไม่ได้รับสถานะ" });
  }
};

export const daysUntilRenewal = (req: Request, res: Response) => {
  const { endDate } = req.body;

  if (!endDate || endDate === "null") {
    return res.json({ daysUntilRenewal: "ยังไม่มีข้อมูล" });
  }

  try {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      return res.json({ daysUntilRenewal: "วันที่ไม่ถูกต้อง" });
    }

    const now = new Date();
    const diffTime = end.getTime() - now.getTime();

    if (diffTime < 0) {
      return res.json({ daysUntilRenewal: "หมดอายุแล้ว" });
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    res.json({ daysUntilRenewal: `${diffDays} วัน` });
  } catch (error) {
    res.json({ daysUntilRenewal: "ยังไม่มีข้อมูล" });
  }
};
