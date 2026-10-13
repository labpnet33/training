var e={id:`ike-crypto-dpd`,h:{en:`IKEv2, crypto choices, DPD, NAT-T and rekeying`,hi:`IKEv2, crypto choices, DPD, NAT-T aur rekeying`},body:{en:`
<p>A tunnel that comes up is not yet a good overlay. For hundreds of spokes you also need sensible crypto, fast failure detection, behaviour behind NAT, and key renewal that does not break traffic. This chapter lists the choices and the reasons.</p>
<h3>IKEv2 or IKEv1?</h3>
<table class="cmp"><tr><th>Point</th><th>IKEv2</th><th>IKEv1</th></tr><tr><td>Negotiation</td><td>Simpler, fewer messages, one phase 2 exchange per child</td><td>Main or aggressive mode, then quick mode</td></tr><tr><td>Mode-config</td><td>Built into the protocol (configuration payload)</td><td>Separate extension, often with XAuth</td></tr><tr><td>NAT-T and DPD</td><td>Part of the design</td><td>Add-ons</td></tr><tr><td>Selectors</td><td>Several traffic selectors per child are possible, but a single wide selector is the practice here</td><td>One pair per phase 2</td></tr><tr><td>Fit for SD-WAN overlay</td><td>Preferred in current designs, including those that Fortinet documents for SD-WAN</td><td>Older designs, or when a peer does not support IKEv2</td></tr></table>
<p>The rule for this track: use <b>IKEv2</b> unless a reason forces IKEv1, and use the same version on both sides. A mismatch gives a failure at the first message.</p>
<h3>Crypto choices</h3>
<p>The exact proposals are a design decision and depend on your security policy and on the models (hardware acceleration differs). The principles hold:</p>
<ul><li><b>Encryption and integrity.</b> AES with SHA-2 is the sound baseline (for example aes256-sha256). AES-GCM combines both in one operation and is efficient on modern hardware; where it is used in the IKE phase, a pseudo-random function must also be set. Do not use DES, 3DES, MD5 or SHA-1 in new designs.</li><li><b>Diffie-Hellman group.</b> Use group 14 or higher; elliptic-curve groups such as 19, 20 and 21 are faster for the same strength. Do not use groups 1, 2 or 5.</li><li><b>PFS in phase 2.</b> Enable it, so that a stolen key does not decrypt later traffic. It costs some CPU on every rekey.</li><li><b>Same proposals both sides.</b> If proposals do not overlap, negotiation fails.</li></ul>
<h3>Authentication</h3>
<p>A pre-shared key is easy but one weak key is shared by all spokes of the overlay. Certificates give each spoke its own identity and allow a single branch to be revoked. For a dial-up hub, an identity check (peer ID or certificate subject) is what limits who may connect. Chapter 4 shows the local ID and peer ID options.</p>
<h3>DPD: how a dead tunnel is noticed</h3>
<p>Dead peer detection sends a probe when the tunnel is idle or silent. If the peer does not answer after a number of retries, the tunnel is torn down and, on the spoke, negotiated again. Three settings control it:</p>
<table class="cmp"><tr><th>Setting</th><th>Meaning</th><th>Design note</th></tr><tr><td><code>dpd on-idle</code></td><td>Probe only when no traffic is received</td><td>Common for spokes; saves traffic on busy tunnels</td></tr><tr><td><code>dpd on-demand</code></td><td>Probe only when traffic is sent and nothing returns</td><td>Fewer probes; slower detection on quiet tunnels</td></tr><tr><td><code>dpd-retrycount</code> and <code>dpd-retryinterval</code></td><td>How many probes and the interval between them</td><td>Detection time is roughly the count times the interval plus the idle time</td></tr></table>
<p>DPD works together with the SD-WAN health check, but they are different: DPD tells that the IKE peer is gone; the SD-WAN health check tells that the path is bad (latency or loss) while the tunnel is still up. You need both. Very aggressive DPD on a lossy link causes flapping, which is worse than slow detection.</p>
<h3>NAT-T</h3>
<p>If a spoke is behind a NAT device, such as an LTE router or a modem, IPsec ESP packets would be blocked or mangled. NAT traversal wraps ESP in UDP 4500. With <code>nattraversal enable</code> (the default) the peers detect NAT and switch automatically, and <code>forced</code> encapsulates always. The firewall rules in front of the hub must allow UDP 500 and 4500 to the hub addresses, or the dial-up gate never sees the spoke.</p>
<p>Behind NAT, the hub sees a different source address and port from what the spoke believes. This is one more reason to use the identity (ID) and not the IP address to recognise a spoke.</p>
<h3>Lifetimes and rekeying</h3>
<p>Keys are renewed on a timer. Phase 1 has <code>keylife</code> (seconds); phase 2 has <code>keylifeseconds</code>. A new key is negotiated before the old one expires, and traffic moves to it without loss when everything works. Points to know:</p>
<ul><li>Keep the lifetimes in a similar range on both sides; when they differ, FortiOS uses the lower, and a very short value causes constant churn on a hub with hundreds of spokes.</li><li>Rekey spreads load if the lifetimes of spokes are not exactly aligned; a hub that restarts and gets all spokes at once is a classic load spike.</li><li>If a spoke has <code>auto-negotiate enable</code>, a failed rekey is followed by a new negotiation attempt.</li></ul>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Timers and NAT-T on the spoke phase 1 and phase 2 (values are design examples)</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set nattraversal enable
        set keylife 28800
        set dpd on-idle
        set dpd-retrycount 3
        set dpd-retryinterval 5
    next
end
config vpn ipsec phase2-interface
    edit "HUB1-VPN1"
        set keylifeseconds 3600
        set pfs enable
    next
end</pre>
<div class="warn"><p><b>Common mistake.</b> Setting DPD very aggressively on all spokes to get fast failover. On a congested or lossy ISP link, a few lost probes tear the tunnel down, and the SD-WAN member goes dead and returns again and again. Use the SD-WAN health check and SLA for performance-based switching and keep DPD moderate.</p></div>
<div class="exam"><p><b>Exam trap.</b> DPD detects a dead IKE peer; the health check detects a poor path. NAT-T uses UDP 4500. Both sides need the same IKE version and overlapping proposals. Do not choose weak groups or algorithms for new designs.</p></div>
<div class="scn"><h4>Every night at 03:00</h4><p>A hub with 300 spokes showed a CPU peak and a few seconds of loss each night at the same time. All spokes had been installed together and had the same phase 2 lifetime, so they all rekeyed together. The team changed the lifetime values by branch group, and the peaks flattened.</p><p><b>Lesson:</b> Rekey timing is a scale problem. Check it when a hub shows regular load spikes.</p></div>
<div class="iv"><p class="q">"What is the difference between DPD and an SD-WAN health check?"</p><p>DPD checks that the IPsec peer is alive and tears the tunnel down when it is not. A health check measures the path through the tunnel, latency, jitter and loss, and drives SD-WAN rules while the tunnel stays up. A tunnel can have a healthy IKE session and a bad path, so both are used.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Use IKEv2, AES with SHA-2, DH group 14 or higher, and PFS.</li><li>Prefer certificates or identity checks to a single shared key.</li><li>DPD finds dead peers; health checks find bad paths.</li><li>NAT-T uses UDP 4500; allow 500 and 4500 to the hub.</li><li>Watch lifetimes at scale.</li></ul></div>
`,hi:`
<p>Jo tunnel up ho gaya woh abhi accha overlay nahi hai. Saikdon spokes ke liye aapko samajhdaar crypto, tez failure detection, NAT ke peeche behaviour, aur aisa key renewal chahiye jo traffic na tode. Yeh chapter choices aur wajah ki list deta hai.</p>
<h3>IKEv2 ya IKEv1?</h3>
<table class="cmp"><tr><th>Point</th><th>IKEv2</th><th>IKEv1</th></tr><tr><td>Negotiation</td><td>Saral, kam messages, har child ke liye ek phase 2 exchange</td><td>Main ya aggressive mode, phir quick mode</td></tr><tr><td>Mode-config</td><td>Protocol mein built-in (configuration payload)</td><td>Alag extension, aksar XAuth ke saath</td></tr><tr><td>NAT-T aur DPD</td><td>Design ka hissa</td><td>Add-ons</td></tr><tr><td>Selectors</td><td>Har child ke liye kai traffic selectors mumkin, par yahan ek wide selector hi practice hai</td><td>Har phase 2 ke liye ek pair</td></tr><tr><td>SD-WAN overlay ke liye fit</td><td>Current designs mein preferred, un designs mein bhi jo Fortinet SD-WAN ke liye document karta hai</td><td>Purane designs, ya jab peer IKEv2 support na kare</td></tr></table>
<p>Is track ka niyam: jab tak koi wajah majboor na kare <b>IKEv2</b> use karo, aur dono sides par same version. Mismatch pehle message par hi failure deta hai.</p>
<h3>Crypto choices</h3>
<p>Exact proposals design decision hain aur aapki security policy aur models par depend karte hain (hardware acceleration alag hoti hai). Principles wahi rehte hain:</p>
<ul><li><b>Encryption aur integrity.</b> SHA-2 ke saath AES sound baseline hai (jaise aes256-sha256). AES-GCM dono ko ek operation mein jodta hai aur modern hardware par efficient hai; jahan woh IKE phase mein use ho wahan pseudo-random function bhi set karna padta hai. Naye designs mein DES, 3DES, MD5 ya SHA-1 use mat karo.</li><li><b>Diffie-Hellman group.</b> Group 14 ya usse upar use karo; 19, 20 aur 21 jaise elliptic-curve groups same strength ke liye tez hain. Groups 1, 2 ya 5 use mat karo.</li><li><b>Phase 2 mein PFS.</b> Enable karo, taaki churayi hui key baad ka traffic decrypt na kar sake. Har rekey par kuch CPU lagta hai.</li><li><b>Dono sides par same proposals.</b> Proposals overlap na karein to negotiation fail hoti hai.</li></ul>
<h3>Authentication</h3>
<p>Pre-shared key aasan hai par ek kamzor key overlay ke saare spokes share karte hain. Certificates har spoke ko apni identity dete hain aur ek branch ko revoke karna mumkin banate hain. Dial-up hub ke liye identity check (peer ID ya certificate subject) hi woh cheez hai jo tay karti hai ki kaun connect kar sakta hai. Chapter 4 local ID aur peer ID options dikhata hai.</p>
<h3>DPD: dead tunnel kaise notice hota hai</h3>
<p>Dead peer detection tunnel idle ya chup hone par probe bhejta hai. Peer kuch retries ke baad jawab na de to tunnel gira diya jaata hai aur spoke par dobara negotiate hota hai. Teen settings ise control karti hain:</p>
<table class="cmp"><tr><th>Setting</th><th>Matlab</th><th>Design note</th></tr><tr><td><code>dpd on-idle</code></td><td>Sirf tab probe jab koi traffic receive na ho</td><td>Spokes ke liye aam; busy tunnels par traffic bachata hai</td></tr><tr><td><code>dpd on-demand</code></td><td>Sirf tab probe jab traffic bheja jaye aur kuch na lautey</td><td>Kam probes; quiet tunnels par detection dheema</td></tr><tr><td><code>dpd-retrycount</code> aur <code>dpd-retryinterval</code></td><td>Kitne probes aur unke beech ka interval</td><td>Detection time lagbhag count guna interval plus idle time</td></tr></table>
<p>DPD SD-WAN health check ke saath kaam karta hai, par dono alag hain: DPD batata hai ki IKE peer chala gaya; SD-WAN health check batata hai ki path kharab hai (latency ya loss) jabki tunnel abhi up hai. Dono chahiye. Lossy link par bahut aggressive DPD flapping paida karta hai, jo dheemi detection se bura hai.</p>
<h3>NAT-T</h3>
<p>Spoke NAT device ke peeche ho, jaise LTE router ya modem, to IPsec ESP packets block ya mangle ho jaate. NAT traversal ESP ko UDP 4500 mein lapeta hai. <code>nattraversal enable</code> (default) ke saath peers NAT detect karke automatically switch karte hain, aur <code>forced</code> hamesha encapsulate karta hai. Hub ke aage ke firewall rules ko hub addresses par UDP 500 aur 4500 allow karne chahiye, warna dial-up gate ko spoke kabhi dikhta hi nahi.</p>
<p>NAT ke peeche hub ko alag source address aur port dikhta hai jo spoke maanta hai us se. Spoke ko IP address nahi balki identity (ID) se pehchanne ki yeh ek aur wajah hai.</p>
<h3>Lifetimes aur rekeying</h3>
<p>Keys timer par renew hoti hain. Phase 1 ke paas <code>keylife</code> (seconds) hai; phase 2 ke paas <code>keylifeseconds</code>. Nayi key purani ke expire hone se pehle negotiate hoti hai, aur sab theek ho to traffic bina loss ke usme chala jaata hai. Jaanne ke points:</p>
<ul><li>Dono sides par lifetimes ek hi range mein rakho; alag hone par FortiOS kam wali use karta hai, aur bahut chhoti value saikdon spokes wale hub par lagataar churn paida karti hai.</li><li>Spokes ki lifetimes bilkul aligned na hon to rekey load failata hai; hub restart ho aur saare spokes ek saath aayein to yeh classic load spike hai.</li><li>Spoke par <code>auto-negotiate enable</code> ho to failed rekey ke baad nayi negotiation try hoti hai.</li></ul>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Timers and NAT-T on the spoke phase 1 and phase 2 (values are design examples)</span>
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set nattraversal enable
        set keylife 28800
        set dpd on-idle
        set dpd-retrycount 3
        set dpd-retryinterval 5
    next
end
config vpn ipsec phase2-interface
    edit "HUB1-VPN1"
        set keylifeseconds 3600
        set pfs enable
    next
end</pre>
<div class="warn"><p><b>Common galti.</b> Tez failover ke liye saare spokes par DPD bahut aggressive set karna. Congested ya lossy ISP link par kuch lost probes tunnel gira dete hain, aur SD-WAN member baar baar dead hokar wapas aata hai. Performance-based switching ke liye SD-WAN health check aur SLA use karo aur DPD moderate rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> DPD dead IKE peer detect karta hai; health check kharab path. NAT-T UDP 4500 use karta hai. Dono sides ko same IKE version aur overlapping proposals chahiye. Naye designs ke liye kamzor groups ya algorithms mat chuno.</p></div>
<div class="scn"><h4>Har raat 03:00 baje</h4><p>300 spokes wale hub par har raat ek hi samay CPU peak aur kuch second ka loss dikhta tha. Saare spokes ek saath install hue the aur unki phase 2 lifetime same thi, isliye woh sab ek saath rekey karte the. Team ne branch groups ke hisaab se lifetime values badli, aur peaks sapaat ho gaye.</p><p><b>Seekh:</b> Rekey timing scale ki problem hai. Hub par regular load spikes dikhein to ise check karo.</p></div>
<div class="iv"><p class="q">"DPD aur SD-WAN health check mein kya farq hai?"</p><p>DPD check karta hai ki IPsec peer zinda hai aur na ho to tunnel gira deta hai. Health check tunnel ke through path naapta hai, latency, jitter aur loss, aur tunnel up rehte hue SD-WAN rules chalata hai. Tunnel ka IKE session theek ho aur path kharab ho sakta hai, isliye dono use hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>IKEv2, SHA-2 ke saath AES, DH group 14 ya upar, aur PFS use karo.</li><li>Akeli shared key ki jagah certificates ya identity checks ko prefer karo.</li><li>DPD dead peers dhoondhta hai; health checks kharab paths.</li><li>NAT-T UDP 4500 use karta hai; hub ke liye 500 aur 4500 allow karo.</li><li>Scale par lifetimes par nazar rakho.</li></ul></div>
`}};export{e as default};