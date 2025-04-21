<script>
	let { size, color } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path
		d="M17.293 14.293a1 1 0 0 0 1.414 1.414l2.913-2.913.044-.046a.998.998 0 0 0 0-1.496 1.112 1.112 0 0 0-.044-.046l-2.913-2.913a1 1 0 1 0-1.414 1.414L18.586 11H13a1 1 0 1 0 0 2h5.586l-1.293 1.293Z"
		fill={color}
	/>
	<path
		d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h9.5a2.5 2.5 0 0 0 2.5-2.5v-2.767A2.002 2.002 0 0 1 16.267 14H13a2 2 0 1 1 0-4h3.267A2 2 0 0 1 17 7.267V4.5A2.5 2.5 0 0 0 14.5 2H5Z"
		fill={color}
	/>
</svg>
