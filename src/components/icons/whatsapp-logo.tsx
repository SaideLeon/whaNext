import type { SVGProps } from 'react';

export function WhatsAppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52s-.67-.816-.916-1.103c-.247-.288-.494-.248-.67.001-.174.248-.701.802-.867.998-.166.198-.335.223-.606.074-.272-.149-1.013-.374-1.928-1.179-.712-.613-1.153-1.359-1.327-1.585-.174-.228-.368-.192-.542-.192-.159 0-.335-.012-.483-.012s-.369.019-.542.315c-.174.297-.615.883-.615 1.715s.644 1.983.719 2.132c.075.149 1.207 1.843 2.922 2.591.41.193.727.309.976.384.468.14.853.123 1.181.075.38-.057 1.164-.475 1.338-.94.174-.466.174-.867.124-.94s-.074-.124-.148-.223z" />
      <path d="M21 12.997V12c0-4.97-4.03-9-9-9S3 7.03 3 12c0 1.892.592 3.639 1.575 5.065L3 21l4.05-1.012A8.916 8.916 0 0 0 12 21a8.96 8.96 0 0 0 6.228-2.641 8.43 8.43 0 0 0 2.092-3.26C20.69 14.602 21 13.822 21 12.997z" />
    </svg>
  );
}
