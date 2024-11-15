<script>

    import { PUBLIC_RESPONSIBLE_FOR_WEBSITE_HTML } from "$env/static/public";

</script>
<svelte:head>
    <title>Impressum | VLANT-LogUp</title>
</svelte:head>

<div class="card shadow-lg m-4 w-fit">
    <div class="card-body">
        <h2 class="text-lg font-bold">Impressum</h2>
        <p>
            <a href="/" class="link">Zurück</a>
        </p>
        <p>Angaben gemäß § 5 TMG:</p>

        <p>
            {@html PUBLIC_RESPONSIBLE_FOR_WEBSITE_HTML}
        </p>
    </div>
</div>
