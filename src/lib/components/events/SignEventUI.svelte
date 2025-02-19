<script>
	let { text, onChange } = $props();
</script>

<h3>Sign</h3>
<input type="text" value={text} onchange={onChange} />
