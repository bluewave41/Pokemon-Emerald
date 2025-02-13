<script>
	import { page } from '$app/state';

	let { data } = $props();
	console.log(data);
</script>

<h1>{page.params.map}</h1>
