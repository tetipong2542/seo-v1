# Keywords & Internal Links Analysis

## 🎯 ฟีเจอร์ใหม่: การวิเคราะห์ Keywords และ Internal Links

ระบบได้รับการปรับปรุงให้มีการวิเคราะห์และตรวจสอบการใช้ keywords และ internal links ในเนื้อหาที่สร้างขึ้นอย่างละเอียด

## ✨ คุณสมบัติที่เพิ่มเข้ามา

### 1. **Prompt ที่เข้มงวดขึ้น**
- เน้นย้ำการใช้ keywords ตามจำนวนที่ระบุอย่างเคร่งครัด
- กำหนดรูปแบบ internal links ที่ชัดเจน
- แสดงสรุปข้อมูล keywords และ links ที่ต้องใช้
- เพิ่มข้อกำหนดและข้อห้ามที่ชัดเจน

### 2. **การวิเคราะห์อัตโนมัติ**
- นับจำนวน keywords ที่ใช้จริงในเนื้อหา
- ตรวจสอบการมีอยู่ของ internal links
- เปรียบเทียบกับจำนวนที่กำหนด
- สร้างรายงานการวิเคราะห์

### 3. **Logging ที่ละเอียด**
- แสดงข้อมูล keywords ที่ส่งไปยัง AI
- แสดงผลการวิเคราะห์ในแต่ละขั้นตอน
- สรุปผลการตรวจสอบ

## 📋 รูปแบบข้อมูลที่ส่งไปยัง AI

```
📋 รายการ Keywords และ Internal Links ที่ต้องใช้ให้ครบถ้วน:
1. คำสำคัญ: "SEO" ใช้ 3 ครั้งใน Internal Link: /seo-guide
2. คำสำคัญ: "Digital Marketing" ใช้ 2 ครั้งใน Internal Link: /digital-marketing

สรุปการใช้ Keywords: ต้องใช้ทั้งหมด 5 ครั้ง จากคำสำคัญ "SEO", "Digital Marketing"
จำนวน Internal Links: ต้องมี 2 ลิงก์
```

## 🎯 ข้อกำหนดที่เน้นย้ำไปยัง AI

### Keywords Usage - บังคับ:
- ใช้แต่ละคำสำคัญตามจำนวนที่ระบุ (ไม่มากไม่น้อย)
- กระจายการใช้อย่างเป็นธรรมชาติในเนื้อหา

### Internal Links - บังคับ:
- สร้างลิงก์ในรูปแบบ `[คำสำคัญ](ลิงก์)`
- ใช้ relative path ขึ้นต้นด้วย `/`
- ห้ามใส่ domain หรือ URL เต็ม

## 📊 การวิเคราะห์ผลลัพธ์

ระบบจะวิเคราะห์เนื้อหาที่สร้างได้โดยอัตโนมัติ:

### Keywords Analysis:
```
📊 Keywords Analysis:
  ✅ "SEO": 3/3 times
  🔗 Link "/seo-guide": ✅ Found
  ⚠️ "Digital Marketing": 1/2 times
  🔗 Link "/digital-marketing": ❌ Missing
```

### Summary:
```
📈 Summary: Keywords 4/5, Links 1/2
```

## 🔧 Technical Implementation

### Type Definitions ใหม่:

```typescript
export interface KeywordAnalysis {
  keyword: string;
  expected: number;
  actual: number;
  link: string;
  linkFound: boolean;
  linkMatches: string[];
}

export interface ContentAnalysis {
  wordCount: number;
  keywordAnalysis: KeywordAnalysis[];
  summary: {
    totalExpected: number;
    totalActual: number;
    linksExpected: number;
    linksFound: number;
  };
}
```

### การวิเคราะห์:

1. **Keywords Counting**: ใช้ Regular Expression หา keywords (case insensitive)
2. **Links Detection**: ตรวจหา pattern `[text](link)` ที่ตรงกับลิงก์ที่กำหนด
3. **Summary Generation**: รวมผลการวิเคราะห์ทั้งหมด

## 📱 การใช้งาน

### ใน SEO Form:
1. กรอก Keywords และ Internal Links ตามปกติ
2. ระบุ frequency สำหรับแต่ละ keyword
3. ส่งฟอร์ม

### ผลลัพธ์:
- ได้เนื้อหาที่มี keywords และ links ครบถ้วน
- ข้อความแจ้งผลการวิเคราะห์
- รายงานการตรวจสอบใน console logs

## 🧪 การทดสอบ

ใช้ไฟล์ `test-keywords.js`:

```bash
node test-keywords.js
```

หรือใช้ curl:

```bash
curl -X POST http://localhost:3000/api/seo-onpage-form \
  -H "Content-Type: application/json" \
  -d '{
    "website_name": "ทดสอบ Keywords",
    "keywords_links": [
      {"keyword": "SEO", "link": "/seo", "frequency": 3},
      {"keyword": "การตลาด", "link": "/marketing", "frequency": 2}
    ],
    ...
  }'
```

## 🎯 ผลลัพธ์ที่คาดหวัง

- เนื้อหาจะมี keywords ตามจำนวนที่กำหนดแน่นอน
- Internal links จะครบถ้วนทุกลิงก์
- รูปแบบลิงก์จะเป็น `[text](relative-path)`
- ข้อความยืนยันการตรวจสอบใน response

## ⚠️ หมายเหตุ

 