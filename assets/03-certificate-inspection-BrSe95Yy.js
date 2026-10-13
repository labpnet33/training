var e={id:`certificate-inspection`,h:{en:`Certificate inspection: the light-touch default`,hi:`Certificate inspection: halka-phulka default`},body:{en:`
<p>Certificate inspection is the polite way of looking at encrypted traffic. The FortiGate reads the handshake, makes a decision, and then steps aside. It never decrypts the session, so the user's browser connects to the real server with the real certificate and the browser shows no warning. Because of that, it is the usual starting point and the usual choice for guests and personal devices.</p>

<h3>What certificate inspection does</h3>
<ul>
<li>Reads the <b>SNI</b> and, on TLS 1.2, the server <b>certificate</b> to learn the host name.</li>
<li>Lets the <b>web filter</b> apply category and URL-list rules by host name (not by path).</li>
<li>Lets <b>application control</b> use the handshake name as an identification hint.</li>
<li>Validates the server certificate: expired, revoked, untrusted or name-mismatch certificates can be allowed, blocked or ignored per setting.</li>
<li>Can log SSL events: exemptions, anomalies and handshake details.</li>
</ul>
<p>What it does <b>not</b> do: scan files with antivirus, run IPS signatures on encrypted payloads, filter by URL path or search keyword, or apply data-leak rules. Those need deep inspection (chapter 4).</p>

<h3>The built-in profile and a custom one</h3>
<p>FortiOS ships read-only built-in profiles: <code>no-inspection</code>, <code>certificate-inspection</code>, <code>deep-inspection</code>. In many versions the built-in <code>certificate-inspection</code> profile already inspects the secure web protocol on port 443 at the certificate level. Because built-ins cannot be edited, you clone one to change anything.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall ssl-ssh-profile
    edit "NK-CERT"
        set comment "Guests and personal devices: certificate inspection"
        config h&#116;tps
            set ports 443
            set status certificate-inspection
            set expired-server-cert block
            set revoked-server-cert block
            set untrusted-server-cert allow
        end
        config ssl-exempt
        end
        set ssl-exemption-log enable
        set ssl-anomaly-log enable
        set ssl-server-cert-log enable
    next
end
config firewall policy
    edit 20
        set name "GUEST-to-WAN"
        set srcintf "port3"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set ssl-ssh-profile "NK-CERT"
        set webfilter-profile "NK-WEB"
        set nat enable
    next
end</pre>
<p>Settings such as <code>expired-server-cert</code>, <code>revoked-server-cert</code> and <code>untrusted-server-cert</code> take actions like <code>allow</code>, <code>block</code> or <code>ignore</code>. Blocking expired and revoked certificates is a cheap security gain that needs no CA on clients. The exact set of fields varies a little by FortiOS build, so use <code>set ?</code> in the CLI of your version.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Certificate inspection">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">ClientHello</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">SNI read</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Server cert</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">validated</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Decision</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">allow or block</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Session</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">untouched</text>
</svg><p class="cap">The FortiGate reads and validates, then lets the original encrypted session pass.</p></div>

<h3>Where it is the right answer</h3>
<table class="cmp"><tr><th>Situation</th><th>Why certificate inspection fits</th></tr>
<tr><td>Guest Wi-Fi and BYOD</td><td>No CA can be installed on devices you do not manage</td></tr>
<tr><td>Privacy-sensitive users</td><td>Content stays private; only the site name is used</td></tr>
<tr><td>Low-power FortiGate models</td><td>Much lower CPU cost than decrypting</td></tr>
<tr><td>First stage of a rollout</td><td>Gains category blocking with no user impact</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A Pune guest user opens <code>royal-casino.example</code>. The FortiGate reads the SNI, the web filter policy finds category Gambling, and the session is blocked at the handshake: the block cannot show a friendly page the way plain HTTP can, because showing one would require decrypting. The user simply sees the connection fail or a certificate-related error. For a normal site the browser connects directly and its own padlock shows the real site certificate.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting a block page for blocked HTTPS sites under certificate inspection. Without decryption the FortiGate cannot return a web page inside the encrypted session, so some browsers show a connection error or a replacement certificate error instead. Tell your helpdesk, and consider deep inspection (with consent) for managed users if you need a clear block page.</p></div>
<div class="exam"><p><b>Exam trap.</b> Certificate inspection inspects the certificate and handshake only, not the payload. Antivirus, IPS content inspection and URL-path filtering on encrypted sessions need deep inspection. It requires no CA installation on clients.</p></div>

<div class="scn"><h4>The guest network that stayed fast</h4><p>A training hall in Pune ran 300 guest devices through a small FortiGate. When the team tried deep inspection for a day, CPU stayed above 90 percent and video calls stuttered, and hundreds of phones raised certificate warnings. They reverted to certificate inspection with the web filter blocking Malicious Websites and Phishing by name. CPU fell, nobody saw warnings, and the major risks were still covered.</p><p><b>Lesson:</b> certificate inspection gives a large share of the benefit at a small share of the cost.</p></div>

<div class="iv"><p class="q">"When would you choose certificate inspection over deep inspection?"</p><p>For guest and BYOD networks where clients cannot trust the FortiGate CA, for privacy-sensitive traffic, on lower-powered hardware, and as a first stage of rollout. I would explain that I still get category blocking by SNI and certificate validation, but not antivirus, IPS payload inspection or URL-path filtering on encrypted traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Certificate inspection reads the handshake and certificate; it does not decrypt.</li>
<li>No CA is needed on clients and users see no warning.</li>
<li>Enables host-name category filtering and certificate validation.</li>
<li>Cannot scan files, run payload IPS or filter by URL path.</li>
<li>Built-in profiles are read-only; clone to customise.</li>
</ul></div>
`,hi:`
<p>Certificate inspection encrypted traffic ko dekhne ka vinamra tareeka hai. FortiGate handshake padhta hai, decision leta hai, aur phir side ho jaata hai. Woh session ko kabhi decrypt nahi karta, isliye user ka browser asli server se asli certificate ke saath connect hota hai aur browser koi warning nahi dikhata. Isi wajah se yeh aam starting point hai aur guests tatha personal devices ke liye aam choice.</p>

<h3>Certificate inspection kya karta hai</h3>
<ul>
<li>Host name jaanne ke liye <b>SNI</b> aur TLS 1.2 mein server <b>certificate</b> padhta hai.</li>
<li><b>Web filter</b> ko host name se (path se nahi) category aur URL-list rules lagane deta hai.</li>
<li><b>Application control</b> ko handshake naam ko identification hint ki tarah use karne deta hai.</li>
<li>Server certificate validate karta hai: expired, revoked, untrusted ya name-mismatch certificates ko setting ke hisaab se allow, block ya ignore kar sakta hai.</li>
<li>SSL events log kar sakta hai: exemptions, anomalies aur handshake details.</li>
</ul>
<p>Jo yeh <b>nahi</b> karta: antivirus se files scan, encrypted payload par IPS signatures, URL path ya search keyword se filter, ya data-leak rules. Inke liye deep inspection chahiye (chapter 4).</p>

<h3>Built-in profile aur custom profile</h3>
<p>FortiOS read-only built-in profiles ke saath aata hai: <code>no-inspection</code>, <code>certificate-inspection</code>, <code>deep-inspection</code>. Kai versions mein built-in <code>certificate-inspection</code> profile pehle se port 443 ke secure web protocol ko certificate level par inspect karta hai. Built-ins edit nahi hote, isliye kuch badalna ho to clone karo.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall ssl-ssh-profile
    edit "NK-CERT"
        set comment "Guests and personal devices: certificate inspection"
        config h&#116;tps
            set ports 443
            set status certificate-inspection
            set expired-server-cert block
            set revoked-server-cert block
            set untrusted-server-cert allow
        end
        config ssl-exempt
        end
        set ssl-exemption-log enable
        set ssl-anomaly-log enable
        set ssl-server-cert-log enable
    next
end
config firewall policy
    edit 20
        set name "GUEST-to-WAN"
        set srcintf "port3"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set ssl-ssh-profile "NK-CERT"
        set webfilter-profile "NK-WEB"
        set nat enable
    next
end</pre>
<p><code>expired-server-cert</code>, <code>revoked-server-cert</code> aur <code>untrusted-server-cert</code> jaise settings <code>allow</code>, <code>block</code> ya <code>ignore</code> jaise actions lete hain. Expired aur revoked certificates block karna sasta security gain hai jisme clients par CA nahi chahiye. Fields ka exact set FortiOS build ke hisaab se thoda alag hota hai, isliye apne version ke CLI mein <code>set ?</code> use karo.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Certificate inspection">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">ClientHello</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">SNI padha</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Server cert</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">validate</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Decision</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">allow ya block</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Session</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">untouched</text>
</svg><p class="cap">FortiGate padhta aur validate karta hai, phir original encrypted session ko jaane deta hai.</p></div>

<h3>Jahan yeh sahi jawab hai</h3>
<table class="cmp"><tr><th>Situation</th><th>Certificate inspection kyun fit hai</th></tr>
<tr><td>Guest Wi-Fi aur BYOD</td><td>Jin devices ko aap manage nahi karte unpar CA install nahi ho sakta</td></tr>
<tr><td>Privacy-sensitive users</td><td>Content private rehta hai; sirf site name use hota hai</td></tr>
<tr><td>Low-power FortiGate models</td><td>Decrypt karne se bahut kam CPU cost</td></tr>
<tr><td>Rollout ka pehla stage</td><td>User impact ke bina category blocking milti hai</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pune ka ek guest user <code>royal-casino.example</code> kholta hai. FortiGate SNI padhta hai, web filter policy category Gambling dhoondhti hai, aur session handshake par hi block ho jaata hai: block plain HTTP ki tarah friendly page nahi dikha sakta, kyunki page dikhane ke liye decrypt karna padta. User ko bas connection fail ya certificate-related error dikhta hai. Normal site ke liye browser seedha connect hota hai aur uska padlock asli site certificate dikhata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Certificate inspection mein blocked HTTPS sites ke liye block page ki umeed. Decryption ke bina FortiGate encrypted session ke andar web page nahi lauta sakta, isliye kuch browsers connection error ya replacement certificate error dikhate hain. Helpdesk ko batao, aur clear block page chahiye to managed users ke liye (consent ke saath) deep inspection socho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Certificate inspection sirf certificate aur handshake inspect karta hai, payload nahi. Encrypted sessions par antivirus, IPS content inspection aur URL-path filtering ke liye deep inspection chahiye. Clients par CA installation ki zaroorat nahi.</p></div>

<div class="scn"><h4>Guest network jo fast raha</h4><p>Pune ke training hall mein 300 guest devices chhote FortiGate se jaate the. Team ne ek din deep inspection try kiya to CPU 90 percent se upar raha, video calls atakne lage, aur saikdon phones ne certificate warnings uthayi. Unhone certificate inspection par wapas aakar web filter se Malicious Websites aur Phishing naam se block kiye. CPU gira, kisi ko warnings nahi dikhi, aur major risks phir bhi cover rahe.</p><p><b>Lesson:</b> certificate inspection chhoti cost par fayde ka bada hissa deta hai.</p></div>

<div class="iv"><p class="q">"Deep inspection ke bajay certificate inspection kab chunoge?"</p><p>Guest aur BYOD networks ke liye jahan clients FortiGate CA par trust nahi kar sakte, privacy-sensitive traffic ke liye, lower-powered hardware par, aur rollout ke pehle stage ke roop mein. Main batata hoon ki SNI se category blocking aur certificate validation milti hai, lekin encrypted traffic par antivirus, IPS payload inspection ya URL-path filtering nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Certificate inspection handshake aur certificate padhta hai; decrypt nahi karta.</li>
<li>Clients par CA nahi chahiye aur users ko warning nahi dikhti.</li>
<li>Host-name category filtering aur certificate validation enable karta hai.</li>
<li>Files scan, payload IPS ya URL path filter nahi kar sakta.</li>
<li>Built-in profiles read-only hain; customise karne ke liye clone.</li>
</ul></div>
`}};export{e as default};