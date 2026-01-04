<script>
	import { Button } from '$lib/components/ui/button';
</script>

<div class="grid grid-cols-2 items-center gap-4">
	<Button variant="outline" onclick={() => window.location.reload()}>Reload</Button>
	<Button class="h-10" variant="secondary" onclick={() => history.go(-1)}>Go Back</Button>
</div>
