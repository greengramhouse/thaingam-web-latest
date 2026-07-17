/**
 * ผลลัพธ์มาตรฐานของ Server Action ทุกตัว — ไม่ throw ข้าม network boundary
 * แต่คืน object ให้ฟอร์มเอาไปแสดงได้ (`fieldErrors` map กลับเข้าช่องที่ผิดผ่าน `setError`)
 *
 * ไฟล์นี้ **ไม่มี `"use server"`** ตั้งใจ — โมดูล "use server" export ได้แต่ async function
 * type เลยต้องอยู่นอกไฟล์ action (และทำให้ taxonomy ไม่ต้อง import ข้ามไปหา news)
 */
export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
