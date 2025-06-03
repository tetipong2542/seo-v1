import SEOForm from '@/components/SEOForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ระบบสร้างเนื้อหา SEO Onpage
          </h1>
          <p className="text-lg text-gray-600">
            สร้างเนื้อหา SEO ที่มีคุณภาพสูงด้วย AI อัตโนมัติ
          </p>
        </div>
        <SEOForm />
      </div>
    </main>
  )
}
