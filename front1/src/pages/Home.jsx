import React from 'react';

// SVG Icons as components
const Music = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const Users = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const Mic2 = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const Play = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const Volume2 = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const Radio = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
    <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
  </svg>
);

const Headphones = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3EB' }}>

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm text-amber-800 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 animate-pulse"></span>
            Now Live: Music Club Kukps
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-6 leading-tight">
            Music Club<br/>
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Kukps
            </span>
          </h1>
          
          <p className="text-xl text-amber-800 mb-12 max-w-2xl mx-auto leading-relaxed">
            ชมรมดนตรีที่รวมเสียงเพลงและความคิดสร้างสรรค์<br/>
            เพื่อสร้างประสบการณ์ทางดนตรีที่ไม่เหมือนใคร
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group bg-amber-900 text-white px-8 py-4 rounded-full font-medium hover:bg-amber-800 transition-all duration-300 flex items-center shadow-lg">
              <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              เริ่มต้นกับเรา
            </button>
            <button className="text-amber-800 px-8 py-4 font-medium hover:text-amber-900 transition-colors">
              เรียนรู้เพิ่มเติม →
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-6" style={{ backgroundColor: '#F0E9D8' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="group bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-amber-100">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-3">Live Performance</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                การแสดงสดที่เต็มไปด้วยพลังและความหลงใหล
              </p>
            </div>
            
            <div className="group bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-amber-100">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-3">Community</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                ชุมชนนักดนตรีที่แบ่งปันความรักในเสียงเพลง
              </p>
            </div>
            
            <div className="group bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-amber-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-3">Studio Access</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                อุปกรณ์และสตูดิโอระดับมืออาชีพ
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section 01 */}
          <div className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-amber-200 bg-opacity-60 rounded-full text-sm text-amber-800 mb-6">
                  01 • วัตถุประสงค์
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6 leading-tight">
                  ยกระดับ<br/>
                  ความสามารถ<br/>
                  ทางดนตรี
                </h2>
                <p className="text-lg text-amber-800 leading-relaxed mb-8">
                  ชมรมดนตรีมีวัตถุประสงค์เพื่อส่งเสริมและพัฒนาความสามารถทางด้านดนตรี 
                  ส่งเสริมให้การรวมรวมดนตรีแนวต่าง ๆ สร้างความสัมพันธ์ที่ดีต่อกันในด้านการแบ่งปันความรู้
                </p>
                <button className="text-amber-800 font-medium hover:text-amber-900 transition-colors">
                  ดูรายละเอียดเพิ่มเติม →
                </button>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl overflow-hidden shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Volume2 className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-8 right-8 w-16 h-16 bg-white bg-opacity-90 rounded-2xl shadow-lg flex items-center justify-center backdrop-blur-sm">
                    <Music className="w-8 h-8 text-amber-700" />
                  </div>
                  <div className="absolute bottom-8 left-8 w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl shadow-lg flex items-center justify-center">
                    <Mic2 className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 02 */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl overflow-hidden shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Calendar className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-8 left-8 w-16 h-16 bg-white bg-opacity-90 rounded-2xl shadow-lg flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-8 h-8 text-amber-700" />
                  </div>
                  <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl shadow-lg flex items-center justify-center">
                    <Radio className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center px-3 py-1 bg-emerald-200 bg-opacity-60 rounded-full text-sm text-emerald-800 mb-6">
                  02 • กิจกรรม
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6 leading-tight">
                  กิจกรรม<br/>
                  ที่หลากหลาย<br/>
                  และสร้างสรรค์
                </h2>
                <p className="text-lg text-amber-800 leading-relaxed mb-8">
                  การศึกษาดนตรีเป็นประจำทุกสัปดาห์ การแลกเปลี่ยนเรียนรู้ จัดงานกิจกรรมประจำปี 
                  Workshops การร่วมมือกับศิษยดนตรี และการเชิญชวนผู้เชี่ยวชาญ
                </p>
                <button className="text-emerald-800 font-medium hover:text-emerald-900 transition-colors">
                  ดูตารางกิจกรรม →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-amber-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            พร้อมที่จะเข้าร่วมกับเราแล้วหรือยัง?
          </h2>
          <p className="text-xl text-amber-100 mb-12 max-w-2xl mx-auto">
            MC (Music Club) เปิดรับสมาชิกใหม่ประจำปีการศึกษา 2569 
            มาร่วมเป็นส่วนหนึ่งของชุมชนดนตรีที่สร้างสรรค์
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-amber-900 px-8 py-4 rounded-full font-medium hover:bg-amber-50 transition-colors shadow-lg">
              สมัครสมาชิก
            </button>
            <button className="border border-amber-200 text-white px-8 py-4 rounded-full font-medium hover:border-amber-100 hover:bg-amber-800 transition-colors">
              ติดต่อสอบถาม
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-amber-200" style={{ backgroundColor: '#F0E9D8' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-amber-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="font-semibold text-amber-900">Music Club Kukps</span>
            </div>
            <div className="flex space-x-6 text-sm text-amber-700">
              <a href="#" className="hover:text-amber-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-amber-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-amber-900 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-amber-200 text-center text-sm text-amber-600">
            © 2025 Music Club Kukps. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}