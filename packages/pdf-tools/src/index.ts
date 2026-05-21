export function parsePdfPlaceholder(pdfBuffer: ArrayBuffer) {
	return {
		pages: 0,
		text: 'PDF extraction is not configured yet.',
		source: '@betterbarmm/pdf-tools',
	}
}
