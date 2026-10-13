var e={id:`access-methods`,h:{en:`Remote access and management methods: VPNs, jump hosts, in-band and out-of-band`,hi:`Remote access aur management methods: VPNs, jump hosts, in-band aur out-of-band`},body:{en:`
<p>Think of how staff reach a head office. Two branches are joined by a private company road that is always open (a site-to-site VPN). A salesperson travelling alone uses a personal pass to enter through a guarded gate (a client-to-site VPN). The server room is reached only through a supervised lobby where everyone signs in (a jump host). And the building has a separate service entrance that still works when the main gate is blocked (out-of-band management). Objective 3.5 of Network+ is about choosing the right door for each job.</p>

<h3>Site-to-site VPN</h3>
<p>A <b>site-to-site VPN</b> connects two networks, such as a branch and head office, across the internet. The two gateways (routers or firewalls) build an encrypted tunnel, normally <b>IPsec</b>, and keep it up permanently. Users at either site do nothing special; their traffic to the other site's subnets is encrypted automatically at the gateway. It replaces expensive private lines for many companies.</p>

<h3>Client-to-site (remote access) VPN</h3>
<p>A <b>client-to-site VPN</b> connects one user's device to the corporate network through a VPN concentrator or firewall. Two styles:</p>
<ul>
<li><b>Clientful</b>: an installed VPN client (agent) builds an IPsec or SSL/TLS tunnel and gives the laptop an internal address, so it can reach almost anything the policy allows, including non-web applications.</li>
<li><b>Clientless</b>: the user opens a browser to a TLS portal and reaches only published web applications (and sometimes remote desktop through the browser). Nothing is installed, which suits contractors and unmanaged devices, but access is narrower.</li>
</ul>
<p><b>Split tunnel vs full tunnel.</b> In a <b>full tunnel</b>, all of the remote user's traffic, including internet browsing, goes through the VPN to head office, where the firewall and web filters inspect it. In a <b>split tunnel</b>, only traffic for corporate subnets uses the tunnel and internet traffic goes directly out of the user's home connection. Split tunnelling saves head-office bandwidth; full tunnelling gives more control and visibility.</p>

<div class="eg"><p><b>Worked example: split or full?</b> 400 remote staff each stream about 3 Mbps of video meetings hosted on a cloud service. With a full tunnel that is 1.2 Gbps in and out of the head office's 1 Gbps internet link, which saturates it. With a split tunnel the meetings go direct and only about 80 Mbps of internal application traffic crosses the tunnel. A common compromise: split tunnel for a short list of trusted cloud services, full tunnel for everything else.</p></div>

<h3>Connection methods for managing devices</h3>
<table class="cmp"><tr><th>Method</th><th>How</th><th>Notes</th></tr>
<tr><td><b>SSH</b></td><td>Encrypted CLI over TCP 22</td><td>The standard for remote CLI; never Telnet (TCP 23, clear text)</td></tr>
<tr><td><b>GUI</b></td><td>Web interface over HTTPS (TCP 443) or a vendor application</td><td>Disable the unencrypted web server; use a trusted certificate</td></tr>
<tr><td><b>API</b></td><td>Programs send REST or similar requests, usually over HTTPS, authenticated with tokens or keys</td><td>Basis of automation; protect tokens like passwords</td></tr>
<tr><td><b>Console</b></td><td>Serial or USB cable directly to the device's console port</td><td>Needs physical access; works even when the network is down; used for initial setup and recovery</td></tr>
</table>

<h3>Jump box (jump host)</h3>
<p>A <b>jump box</b> is a hardened, closely monitored server that administrators log in to first, usually with MFA, before connecting onward to network devices. The devices accept management only from the jump box's address, so a stolen laptop on the user VLAN cannot reach them. It also gives one place to record sessions. Lab 1 uses the same idea on a small scale: EDGE accepts SSH only from the admin network 10.0.99.0/24. In production you might narrow it to one host:</p>
<pre class="code"><span class="c">! allow management only from the jump host 10.0.99.5</span>
access-list 10 permit host 10.0.99.5
line vty 0 4
 access-class 10 in</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Jump host and out-of-band network">
<rect x="10" y="30" width="110" height="46" rx="10" fill="#bae6fd"/><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="13">Admin + MFA</text>
<rect x="190" y="30" width="110" height="46" rx="10" fill="#ddd6fe"/><text x="245" y="58" text-anchor="middle" class="svg-ink" font-size="13">Jump host</text>
<rect x="400" y="30" width="110" height="46" rx="10" fill="#bbf7d0"/><text x="455" y="58" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="530" y="100" width="100" height="46" rx="10" fill="#bbf7d0"/><text x="580" y="128" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<line x1="120" y1="53" x2="190" y2="53" stroke="#64748b" stroke-width="2"/><line x1="300" y1="53" x2="400" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="350" y="45" text-anchor="middle" class="svg-accent" font-size="12">SSH in-band</text>
<rect x="190" y="160" width="140" height="46" rx="10" fill="#fde68a"/><text x="260" y="188" text-anchor="middle" class="svg-ink" font-size="13">Console server</text>
<line x1="330" y1="183" x2="455" y2="76" stroke="#64748b" stroke-dasharray="5 4"/><line x1="330" y1="183" x2="580" y2="146" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="470" y="200" text-anchor="middle" class="svg-muted" font-size="12">out-of-band: console cables, own network or cellular</text>
</svg><p class="cap">In-band management rides the production network; out-of-band has its own path.</p></div>

<h3>In-band vs out-of-band management</h3>
<p><b>In-band management</b> uses the same network that carries user traffic: you SSH to an address on a production interface. It is simple and cheap, but when a routing mistake or failed link breaks the network, you lose management at the same moment you need it most. <b>Out-of-band (OOB) management</b> uses a separate path: a dedicated management network connected to management ports, and <b>console servers</b> wired to each device's console port, often with a cellular or separate internet backup. OOB lets you fix a broken network remotely.</p>
<p>After logging in, check who else is connected:</p>
<pre class="out">EDGE# show users
    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
<span class="hl">   2 vty 0     admin      idle                 00:00:07 10.0.99.10</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Managing everything in-band with no OOB, then losing access after a bad change on a remote site. Leaving the console port with no password in an unlocked room. Giving contractors a clientful full-network VPN when a clientless portal to one application was enough. Storing API tokens in scripts on shared drives.</p></div>

<div class="exam"><p><b>Exam trap.</b> Site-to-site joins networks; client-to-site joins a user. Clientless = browser and TLS portal; clientful = installed agent. Split tunnel sends only corporate traffic through the VPN; full tunnel sends everything. Console access is out-of-band by nature. A jump box is an intermediary hardened host, not a VPN.</p></div>

<div class="scn"><h4>The ACL that locked everyone out</h4><p>An engineer pushed an ACL to a remote branch router over SSH and mistyped a line. The router dropped his own session, and the branch lost its internet link at the same time. Because the branch had a console server with a cellular modem, the engineer connected through the OOB path within five minutes, corrected the ACL on the console and restored service without anyone travelling to site.</p><p><b>Lesson:</b> in-band management fails exactly when you break the network; OOB is your safety net.</p></div>

<div class="iv"><p class="q">"What is the difference between in-band and out-of-band management, and why pay for OOB?"</p><p>In-band uses the production network, so it disappears when the network breaks. OOB uses a dedicated management network, console servers and often cellular backup, so you can still reach devices during outages or after a bad change. Add that OOB is also more secure because management traffic is isolated from users, and combine it with a jump host and MFA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site VPN joins networks through gateways; client-to-site joins individual users.</li>
<li>Clientful uses an installed agent; clientless uses a browser and TLS portal.</li>
<li>Split tunnel saves bandwidth; full tunnel gives central inspection.</li>
<li>Management methods: SSH, GUI over HTTPS, API with tokens, console for physical access.</li>
<li>Jump hosts centralise admin access; out-of-band management survives network outages.</li>
</ul></div>
`,hi:`
<p>Socho staff head office tak kaise pahunchta hai. Do branches ek private company road se judi hain jo hamesha khuli rehti hai (site-to-site VPN). Akela travel kar raha salesperson ek personal pass se guarded gate ke through andar aata hai (client-to-site VPN). Server room tak sirf ek supervised lobby se pahuncha jaata hai jahan sab sign in karte hain (jump host). Aur building ka ek alag service entrance hai jo main gate band hone par bhi kaam karta hai (out-of-band management). Network+ ka objective 3.5 har kaam ke liye sahi darwaza chunne ke baare mein hai.</p>

<h3>Site-to-site VPN</h3>
<p><b>Site-to-site VPN</b> do networks ko, jaise ek branch aur head office ko, internet ke paar jodta hai. Dono gateways (routers ya firewalls) ek encrypted tunnel banate hain, normally <b>IPsec</b>, aur use hamesha up rakhte hain. Kisi bhi site ke users ko kuch khaas nahi karna padta; dusri site ke subnets ke liye unka traffic gateway par apne aap encrypt ho jaata hai. Kai companies ke liye yeh mehngi private lines ki jagah le leta hai.</p>

<h3>Client-to-site (remote access) VPN</h3>
<p><b>Client-to-site VPN</b> ek user ke device ko VPN concentrator ya firewall ke through corporate network se jodta hai. Do styles:</p>
<ul>
<li><b>Clientful</b>: installed VPN client (agent) IPsec ya SSL/TLS tunnel banata hai aur laptop ko internal address deta hai, isliye woh policy mein allowed lagbhag har cheez tak pahunch sakta hai, non-web applications samet.</li>
<li><b>Clientless</b>: user browser mein ek TLS portal kholta hai aur sirf published web applications tak pahunchta hai (aur kabhi kabhi browser ke through remote desktop). Kuch install nahi hota, jo contractors aur unmanaged devices ke liye theek hai, lekin access seemit hota hai.</li>
</ul>
<p><b>Split tunnel vs full tunnel.</b> <b>Full tunnel</b> mein remote user ka saara traffic, internet browsing samet, VPN se head office jaata hai, jahan firewall aur web filters use inspect karte hain. <b>Split tunnel</b> mein sirf corporate subnets ka traffic tunnel use karta hai aur internet traffic seedha user ke ghar ke connection se bahar jaata hai. Split tunnelling head office ki bandwidth bachata hai; full tunnelling zyada control aur visibility deta hai.</p>

<div class="eg"><p><b>Worked example: split ya full?</b> 400 remote staff har ek lagbhag 3 Mbps ki video meetings stream karte hain jo cloud service par hosted hain. Full tunnel mein yeh head office ke 1 Gbps internet link ke andar aur bahar 1.2 Gbps hai, jo use saturate kar deta hai. Split tunnel mein meetings seedhi jaati hain aur sirf lagbhag 80 Mbps internal application traffic tunnel cross karta hai. Common compromise: trusted cloud services ki chhoti list ke liye split tunnel, baaki sab ke liye full tunnel.</p></div>

<h3>Devices manage karne ke connection methods</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise</th><th>Notes</th></tr>
<tr><td><b>SSH</b></td><td>TCP 22 par encrypted CLI</td><td>Remote CLI ka standard; Telnet kabhi nahi (TCP 23, clear text)</td></tr>
<tr><td><b>GUI</b></td><td>HTTPS (TCP 443) par web interface ya vendor application</td><td>Unencrypted web server disable karo; trusted certificate use karo</td></tr>
<tr><td><b>API</b></td><td>Programs REST ya aise requests bhejte hain, aam taur par HTTPS par, tokens ya keys se authenticated</td><td>Automation ka base; tokens ko passwords ki tarah bachao</td></tr>
<tr><td><b>Console</b></td><td>Device ke console port tak seedha serial ya USB cable</td><td>Physical access chahiye; network down hone par bhi kaam karta hai; initial setup aur recovery ke liye</td></tr>
</table>

<h3>Jump box (jump host)</h3>
<p><b>Jump box</b> ek hardened, kareeb se monitor kiya jaane wala server hai jismein administrators pehle login karte hain, aam taur par MFA ke saath, aur phir aage network devices se connect karte hain. Devices sirf jump box ke address se management accept karte hain, isliye user VLAN par chori hua laptop unhe reach nahi kar sakta. Sessions record karne ki bhi ek hi jagah milti hai. Lab 1 yahi idea chhote scale par use karta hai: EDGE sirf admin network 10.0.99.0/24 se SSH accept karta hai. Production mein aap ise ek host tak narrow kar sakte ho:</p>
<pre class="code"><span class="c">! allow management only from the jump host 10.0.99.5</span>
access-list 10 permit host 10.0.99.5
line vty 0 4
 access-class 10 in</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Jump host aur out-of-band network">
<rect x="10" y="30" width="110" height="46" rx="10" fill="#bae6fd"/><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="13">Admin + MFA</text>
<rect x="190" y="30" width="110" height="46" rx="10" fill="#ddd6fe"/><text x="245" y="58" text-anchor="middle" class="svg-ink" font-size="13">Jump host</text>
<rect x="400" y="30" width="110" height="46" rx="10" fill="#bbf7d0"/><text x="455" y="58" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="530" y="100" width="100" height="46" rx="10" fill="#bbf7d0"/><text x="580" y="128" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<line x1="120" y1="53" x2="190" y2="53" stroke="#64748b" stroke-width="2"/><line x1="300" y1="53" x2="400" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="350" y="45" text-anchor="middle" class="svg-accent" font-size="12">SSH in-band</text>
<rect x="190" y="160" width="140" height="46" rx="10" fill="#fde68a"/><text x="260" y="188" text-anchor="middle" class="svg-ink" font-size="13">Console server</text>
<line x1="330" y1="183" x2="455" y2="76" stroke="#64748b" stroke-dasharray="5 4"/><line x1="330" y1="183" x2="580" y2="146" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="470" y="200" text-anchor="middle" class="svg-muted" font-size="12">out-of-band: console cables, apna network ya cellular</text>
</svg><p class="cap">In-band management production network par chalta hai; out-of-band ka apna raasta hota hai.</p></div>

<h3>In-band vs out-of-band management</h3>
<p><b>In-band management</b> wahi network use karta hai jo user traffic le jaata hai: aap production interface ke address par SSH karte ho. Yeh simple aur sasta hai, lekin jab routing ki galti ya failed link network tod de, to aap management usi pal kho dete ho jab uski sabse zyada zaroorat hoti hai. <b>Out-of-band (OOB) management</b> alag raasta use karta hai: management ports se juda dedicated management network, aur har device ke console port se wired <b>console servers</b>, aksar cellular ya alag internet backup ke saath. OOB aapko toota network remotely theek karne deta hai.</p>
<p>Login ke baad check karo ki aur kaun connected hai:</p>
<pre class="out">EDGE# show users
    Line       User       Host(s)              Idle       Location
*  0 con 0                idle                 00:00:00
<span class="hl">   2 vty 0     admin      idle                 00:00:07 10.0.99.10</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> Bina OOB ke sab kuch in-band manage karna, phir remote site par galat change ke baad access kho dena. Unlocked room mein console port ko bina password chhod dena. Contractors ko clientful full-network VPN dena jab ek application ka clientless portal kaafi tha. API tokens ko shared drives par scripts mein rakhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Site-to-site networks ko jodta hai; client-to-site ek user ko. Clientless = browser aur TLS portal; clientful = installed agent. Split tunnel sirf corporate traffic VPN se bhejta hai; full tunnel sab kuch. Console access apne nature se out-of-band hai. Jump box ek intermediary hardened host hai, VPN nahi.</p></div>

<div class="scn"><h4>Woh ACL jisne sabko lock out kar diya</h4><p>Ek engineer ne SSH par remote branch router mein ACL push kiya aur ek line galat type kar di. Router ne uska apna session drop kar diya, aur usi waqt branch ka internet link bhi chala gaya. Kyunki branch mein cellular modem wala console server tha, engineer paanch minute mein OOB raaste se connect hua, console par ACL theek kiya aur bina kisi ke site par gaye service restore kar di.</p><p><b>Seekh:</b> in-band management theek tab fail hota hai jab aap network todte ho; OOB aapka safety net hai.</p></div>

<div class="iv"><p class="q">"In-band aur out-of-band management mein kya farak hai, aur OOB ke liye paisa kyun dein?"</p><p>In-band production network use karta hai, isliye network tootne par gayab ho jaata hai. OOB dedicated management network, console servers aur aksar cellular backup use karta hai, isliye outages mein ya galat change ke baad bhi aap devices tak pahunch sakte ho. Yeh bhi jodo ki OOB zyada secure hai kyunki management traffic users se isolated hota hai, aur ise jump host aur MFA ke saath combine karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Site-to-site VPN gateways ke through networks jodta hai; client-to-site individual users ko.</li>
<li>Clientful installed agent use karta hai; clientless browser aur TLS portal.</li>
<li>Split tunnel bandwidth bachata hai; full tunnel central inspection deta hai.</li>
<li>Management methods: SSH, HTTPS par GUI, tokens wala API, physical access ke liye console.</li>
<li>Jump hosts admin access centralise karte hain; out-of-band management network outages mein bhi bachta hai.</li>
</ul></div>
`}};export{e as default};