export function formatCurrency(value: number | undefined | null, locale = 'pt-BR', currency = 'BRL') {
	if (value == null || Number.isNaN(value)) return '-';
	try {
		return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
	} catch {
		return String(value);
	}
}
