/* The estate's wordmark: "Better" on a crimson highlight, then "BARMM".
   The highlight is the brand crimson in either theme, not --accent, which
   turns a light coral in dark mode that white type cannot sit on. "BARMM"
   takes the text color, so a caller over a dark photograph sets
   `text-white` and nothing else changes; on a dark band, `inverse` turns
   the highlight white and its word crimson. */

export function BrandLogo({ className = '', inverse = false, size = 34 }: { className?: string; inverse?: boolean; size?: number }) {
	return (
		<span className={`inline-flex items-baseline font-extrabold leading-none tracking-[-0.03em] ${className}`} style={{ fontSize: Math.round(size * 0.62) }}>
			<span className={`px-[0.2em] py-[0.08em] ${inverse ? 'bg-white text-[#8a2418]' : 'bg-[#8a2418] text-white'}`}>Better</span>
			<span className='pl-[0.12em]'>BARMM</span>
		</span>
	)
}
