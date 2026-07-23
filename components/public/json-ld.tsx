/**
 * ฝัง structured data (schema.org) ให้ Google เข้าใจว่าหน้านี้คืออะไร
 * → มีสิทธิ์ขึ้น rich result (ชื่อโรงเรียน/ที่อยู่ใน Knowledge panel, วันที่ในผลค้นหาข่าว)
 *
 * ⚠️ ต้อง escape `<` เป็น `<` ก่อนยัดลง <script> ไม่งั้นข้อมูลที่มี `</script>`
 * (เช่นเนื้อหาที่แอดมินพิมพ์) ปิดแท็กก่อนเวลา → กลายเป็นช่องทาง XSS
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
