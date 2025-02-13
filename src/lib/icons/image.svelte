<script>
	let { size, color } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M1 1h14v14H1V1Zm5 8 2 2 5-5v7H3v-1l3-3Zm.5-2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
		fill={color}
	/>
</svg>
