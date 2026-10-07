exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '' };
  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: '' }; }
  const clip = (v, n) => String(v || '').replace(/[\r\n]+/g, ' ').slice(0, n).trim();
  const subject = clip(b.subject, 40), topic = clip(b.topic, 80), level = clip(b.level, 6);
  if (!subject || !topic || !level) return { statusCode: 400, body: '' };
  const prompt = `ช่วยแนะนำแนวทางการอ่านสำหรับนักเรียนไทยระดับ ${level} วิชา${subject} เรื่อง "${topic}" ตามหลักสูตรแกนกลางของไทย ตอบเป็นภาษาไทย กระชับ ไม่เกิน 450 คำ ใช้หัวข้อต่อไปนี้ โดยเขียนหัวข้อขึ้นต้นด้วย ##: สิ่งที่ต้องรู้ (แนวคิดและสูตรสำคัญ) / ลำดับการอ่าน (3-5 ขั้น พร้อมเวลาโดยประมาณ) / ตัวอย่างโจทย์ (2 ข้อ พร้อมเฉลยสั้น ถ้าวิชานี้มีโจทย์) / ข้อผิดพลาดที่พบบ่อย / วิธีเช็กว่าเข้าใจแล้ว เขียนสูตรเป็นข้อความธรรมดา เช่น A = πr² ห้ามใช้ LaTeX ห้ามใส่ลิงก์ และถ้าไม่แน่ใจว่าเรื่องนี้อยู่ในระดับชั้นนี้ให้บอกตรงๆ`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] })
  });
  if (!r.ok) return { statusCode: 502, body: JSON.stringify({ error: 'upstream' }) };
  const d = await r.json();
  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: d.content.map(c => c.text || '').join('') }) };
};
