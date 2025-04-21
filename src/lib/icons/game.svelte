<script>
	let { size, color } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="m0 13 3 1 3-3h4l3 3 3-1-.752-8.272A3 3 0 0 0 12.26 2H3.74A3 3 0 0 0 .752 4.728L0 13Zm12-7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
		fill={color}
	/>
</svg>
