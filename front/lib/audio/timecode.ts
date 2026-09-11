export function parseTimecode(value: string) {
	if (!/^\d+:[0-5]\d$/.test(value) && !/^\d+:[0-5]\d:[0-5]\d$/.test(value)) {
		return null;
	}

	const parts = value.split(":");
	const numbers = parts.map(Number);
	const seconds = numbers.at(-1) ?? 0;
	const minutes = numbers.at(-2) ?? 0;
	const hours = numbers.length === 3 ? numbers[0] : 0;

	return hours * 3600 + minutes * 60 + seconds;
}
