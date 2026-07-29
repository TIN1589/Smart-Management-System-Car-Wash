import { Share2, Sparkles } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant pt-16">
      <div className="grid gap-6 pb-12 md:grid-cols-3">
        <div>
          <h2 className="mb-4 text-base font-medium leading-6 text-primary">AutoWash Pro</h2>
          <p className="text-sm leading-5 text-on-surface-variant">
            Địa chỉ: 123 Đường Số 1, Quận 1, TP. Hồ Chí Minh
            <br />
            Email: contact@autowashpro.com
            <br />
            Hotline: 1900 1234
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-base font-medium leading-6 text-on-surface">Liên kết</h2>
          <a className="mb-2 block text-sm leading-5 text-on-surface-variant hover:text-primary" href="#features">
            Về chúng tôi
          </a>
          <a className="mb-2 block text-sm leading-5 text-on-surface-variant hover:text-primary" href="#features">
            Điều khoản dịch vụ
          </a>
          <a className="block text-sm leading-5 text-on-surface-variant hover:text-primary" href="#features">
            Chính sách bảo mật
          </a>
        </div>
        <div>
          <h2 className="mb-4 text-base font-medium leading-6 text-on-surface">Mạng xã hội</h2>
          <div className="flex gap-4">
            <a
              aria-label="Chia sẻ"
              className="grid size-10 place-items-center rounded-lg border border-outline-variant bg-surface text-on-surface-variant hover:text-primary"
              href="#features"
            >
              <Share2 size={18} />
            </a>
            <a
              aria-label="Cộng đồng"
              className="grid size-10 place-items-center rounded-lg border border-outline-variant bg-surface text-on-surface-variant hover:text-primary"
              href="#features"
            >
              <Sparkles size={18} />
            </a>
          </div>
        </div>
      </div>

      <p className="border-t border-outline-variant py-6 text-center text-xs leading-4 text-on-surface-variant">
        © 2024 AutoWash Pro. All rights reserved. Designed with precision.
      </p>
    </footer>
  )
}
