<script>
    if (localStorage.getItem('cookieAck') != 'true') {
        $('.cookieWarning').delay(500).fadeIn(300);
    };
    cookieAck = () => {
        localStorage.setItem('cookieAck', 'true');
        $('.cookieWarning').fadeOut(300);
    }
</script>