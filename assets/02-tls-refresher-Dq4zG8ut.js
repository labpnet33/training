var e={id:`tls-refresher`,h:{en:`TLS refresher: what a FortiGate can and cannot see`,hi:`TLS refresher: FortiGate kya dekh sakta hai aur kya nahi`},body:{en:`
<p>To understand inspection you need a clear picture of what happens when a browser opens a secure site. This chapter is a short, practical TLS refresher aimed at what the firewall sees at each step.</p>

<h3>The handshake in plain words</h3>
<ol>
<li><b>ClientHello.</b> The browser says: "I want to talk to <code>bank.example</code>. These are the TLS versions and ciphers I support." The requested name is sent in a field called <b>SNI</b> (Server Name Indication), normally in the clear.</li>
<li><b>ServerHello and certificate.</b> The server answers with the chosen cipher and its <b>certificate</b>: a signed document that says "this public key belongs to bank.example, signed by CA X, valid from date A to date B".</li>
<li><b>Verification.</b> The client checks that the certificate name matches, the dates are valid, the signature chain leads to a CA it trusts, and the certificate has not been revoked.</li>
<li><b>Key exchange.</b> Both sides agree on session keys. From this point application data is encrypted.</li>
</ol>
<p>With TLS 1.2 the server certificate is sent in the clear, so a firewall can read it. With <b>TLS 1.3</b> the certificate is encrypted after the ServerHello; a firewall then relies mainly on the SNI, and deep inspection (acting as an endpoint) is the way to read everything. Encrypted Client Hello (ECH), where deployed, hides the SNI too, which is a growing challenge for name-based filtering.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="TLS handshake">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">ClientHello</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">SNI visible</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Certificate</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">TLS 1.2 visible</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Keys agreed</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">from here encrypted</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Application data</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">opaque</text>
</svg><p class="cap">Without decryption, a firewall can use only the early handshake information.</p></div>

<h3>What the FortiGate sees without decrypting</h3>
<table class="cmp"><tr><th>Visible</th><th>Not visible</th></tr>
<tr><td>Source and destination IP, ports, TCP flags</td><td>URL path and query</td></tr>
<tr><td>SNI (server name) in most cases</td><td>Page content and search keywords</td></tr>
<tr><td>Certificate subject and issuer (TLS 1.2)</td><td>Downloaded files</td></tr>
<tr><td>TLS version and cipher</td><td>Attack payloads inside the session</td></tr></table>
<p>This is why the web filter can block <code>royal-casino.example</code> by name under certificate inspection but cannot apply a rule to <code>/news/sports</code> on a legitimate site. The tools you already know show the same limit: the packet sniffer and session table from <b>nse4-diag</b> describe addresses, ports and flags, never the encrypted payload.</p>

<h3>Certificates, CAs and trust</h3>
<p>A <b>certificate authority (CA)</b> is an organisation whose signature clients trust. Operating systems and browsers ship with a <b>trusted root store</b>. A site certificate is usually signed by an <b>intermediate CA</b>, which is signed by a <b>root CA</b>: the <b>chain of trust</b>. A client trusts a site only if the chain ends in a root in its store. This is the lever deep inspection uses: the FortiGate presents certificates signed by <i>its own</i> CA, and clients that have been taught to trust that CA accept them.</p>
<p>Important fields: <b>Subject / SAN</b> (names covered), <b>Issuer</b> (who signed), <b>validity dates</b>, <b>key size and algorithm</b>, and <b>revocation information</b> (CRL or OCSP). Checks on each field are what the FortiGate also performs when it validates the real server on your behalf.</p>

<div class="eg"><p><b>Worked example.</b> A staff browser opens <code>bank.example</code>. Under certificate inspection the FortiGate reads the SNI <code>bank.example</code> and, on TLS 1.2, a certificate issued by a public CA for that name. It verifies the chain and lets the session pass untouched. Under deep inspection the FortiGate would instead create a new certificate for <code>bank.example</code>, signed by its own CA, and present that to the browser. If the browser does not trust the FortiGate CA, a warning appears.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming a firewall can always filter on the website name. With TLS 1.3 and ECH or with traffic that uses an IP address without SNI, name-based rules have less to work with. Plan deep inspection or use IP and ISDB rules for those flows.</p></div>
<div class="exam"><p><b>Exam trap.</b> SNI is the server name sent in the ClientHello and is how certificate inspection and the web filter know the site without decrypting. TLS 1.3 encrypts the certificate, which is why SNI and deep inspection matter more.</p></div>

<div class="scn"><h4>The filter that worked on Monday and failed on Tuesday</h4><p>A site rated as Gambling was blocked by name every day. One Tuesday it loaded. The site's provider had moved it behind a content network that used encrypted client hello for some clients, so the FortiGate no longer saw the real name. The team confirmed the change with a sniffer capture and added a rule to decrypt that traffic for monitored user groups, while keeping IP-based blocks for the provider's known addresses.</p><p><b>Lesson:</b> name-based filtering depends on what the handshake reveals; keep an eye on protocol changes.</p></div>

<div class="iv"><p class="q">"What can a firewall see in a TLS 1.3 session without decrypting?"</p><p>IP addresses, ports, timing, the TLS version and cipher, and normally the SNI in the ClientHello. In TLS 1.3 the server certificate is encrypted, so the firewall cannot read it without terminating the session. It cannot see URLs, content, files or payloads.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNI in the ClientHello is normally visible; TLS 1.3 hides the certificate.</li>
<li>Without decrypting, the FortiGate sees addresses, ports, SNI and handshake details only.</li>
<li>Trust is a chain from site certificate to intermediate to a trusted root.</li>
<li>Deep inspection works because clients are made to trust the FortiGate CA.</li>
<li>Sniffer and session table never show encrypted payloads.</li>
</ul></div>
`,hi:`
<p>Inspection samajhne ke liye aapko saaf picture chahiye ki browser secure site kholta hai to kya hota hai. Yeh chhota, practical TLS refresher hai jo is par focus karta hai ki firewall har step par kya dekhta hai.</p>

<h3>Handshake saadi bhasha mein</h3>
<ol>
<li><b>ClientHello.</b> Browser kehta hai: "Mujhe <code>bank.example</code> se baat karni hai. Yeh TLS versions aur ciphers main support karta hoon." Maanga gaya naam <b>SNI</b> (Server Name Indication) field mein bheja jaata hai, aam taur par clear mein.</li>
<li><b>ServerHello aur certificate.</b> Server chuna hua cipher aur apna <b>certificate</b> bhejta hai: ek signed document jo kehta hai "yeh public key bank.example ki hai, CA X ne sign ki, date A se date B tak valid".</li>
<li><b>Verification.</b> Client check karta hai ki certificate ka naam match hota hai, dates valid hain, signature chain us CA tak jaati hai jise woh trust karta hai, aur certificate revoke nahi hua.</li>
<li><b>Key exchange.</b> Dono taraf session keys par agree hote hain. Yahan se application data encrypted hota hai.</li>
</ol>
<p>TLS 1.2 mein server certificate clear mein jaata hai, isliye firewall use padh sakta hai. <b>TLS 1.3</b> mein ServerHello ke baad certificate encrypted ho jaata hai; firewall tab mukhya roop se SNI par depend karta hai, aur deep inspection (endpoint ki tarah kaam karke) sab kuch padhne ka tareeka hai. Encrypted Client Hello (ECH), jahan deploy ho, SNI bhi chhupa deta hai, jo name-based filtering ke liye badhti challenge hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="TLS handshake">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">ClientHello</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">SNI visible</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Certificate</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">TLS 1.2 visible</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Keys agreed</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">yahan se encrypted</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Application data</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">opaque</text>
</svg><p class="cap">Decryption ke bina firewall sirf shuruaati handshake ki jaankari use kar sakta hai.</p></div>

<h3>Decrypt kiye bina FortiGate kya dekhta hai</h3>
<table class="cmp"><tr><th>Dikhta hai</th><th>Nahi dikhta</th></tr>
<tr><td>Source aur destination IP, ports, TCP flags</td><td>URL path aur query</td></tr>
<tr><td>Zyadatar cases mein SNI (server name)</td><td>Page content aur search keywords</td></tr>
<tr><td>Certificate subject aur issuer (TLS 1.2)</td><td>Downloaded files</td></tr>
<tr><td>TLS version aur cipher</td><td>Session ke andar attack payloads</td></tr></table>
<p>Isiliye web filter certificate inspection mein <code>royal-casino.example</code> ko naam se block kar sakta hai lekin legitimate site ke <code>/news/sports</code> par rule nahi laga sakta. Jo tools aap jaante ho wahi limit dikhate hain: <b>nse4-diag</b> ka packet sniffer aur session table addresses, ports aur flags batate hain, encrypted payload kabhi nahi.</p>

<h3>Certificates, CAs aur trust</h3>
<p><b>Certificate authority (CA)</b> woh organisation hai jiske signature ko clients trust karte hain. Operating systems aur browsers ke saath <b>trusted root store</b> aata hai. Site certificate aam taur par <b>intermediate CA</b> se sign hota hai, jo <b>root CA</b> se sign hota hai: <b>chain of trust</b>. Client site ko tabhi trust karta hai jab chain uske store ke root par khatam ho. Yahi lever deep inspection use karta hai: FortiGate <i>apni khud ki</i> CA se sign kiye certificates present karta hai, aur jin clients ko us CA par trust karna sikhaya gaya hai woh unhe accept karte hain.</p>
<p>Zaroori fields: <b>Subject / SAN</b> (kin names ko cover karta hai), <b>Issuer</b> (kisne sign kiya), <b>validity dates</b>, <b>key size aur algorithm</b>, aur <b>revocation information</b> (CRL ya OCSP). Inhi fields par FortiGate bhi checks karta hai jab woh aapki taraf se asli server validate karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Staff browser <code>bank.example</code> kholta hai. Certificate inspection mein FortiGate SNI <code>bank.example</code> padhta hai aur TLS 1.2 mein us naam ke liye public CA ka issued certificate. Woh chain verify karta hai aur session ko untouched jaane deta hai. Deep inspection mein FortiGate iske bajay <code>bank.example</code> ke liye naya certificate banata, apni CA se sign karta, aur browser ko dikhata. Browser FortiGate CA par trust na kare to warning aati hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki firewall hamesha website ke naam se filter kar sakta hai. TLS 1.3 aur ECH ke saath ya SNI ke bina IP address use karne wale traffic mein name-based rules ke paas kam information hoti hai. Un flows ke liye deep inspection plan karo ya IP aur ISDB rules use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> SNI ClientHello mein bheja gaya server name hai aur isi se certificate inspection aur web filter decrypt kiye bina site jaante hain. TLS 1.3 certificate ko encrypt karta hai, isiliye SNI aur deep inspection zyada matter karte hain.</p></div>

<div class="scn"><h4>Filter jo Monday ko chala aur Tuesday ko fail hua</h4><p>Gambling rate ki hui site roz naam se block hoti thi. Ek Tuesday woh load ho gayi. Site ke provider ne use content network ke peeche move kiya tha jo kuch clients ke liye encrypted client hello use karta tha, isliye FortiGate ko asli naam dikhna band ho gaya. Team ne sniffer capture se change confirm kiya aur monitored user groups ke liye us traffic ko decrypt karne ka rule joda, saath hi provider ke known addresses par IP-based blocks rakhe.</p><p><b>Lesson:</b> name-based filtering handshake kya reveal karta hai us par depend karti hai; protocol changes par nazar rakho.</p></div>

<div class="iv"><p class="q">"TLS 1.3 session mein decrypt kiye bina firewall kya dekh sakta hai?"</p><p>IP addresses, ports, timing, TLS version aur cipher, aur aam taur par ClientHello ka SNI. TLS 1.3 mein server certificate encrypted hota hai, isliye session terminate kiye bina firewall use nahi padh sakta. URLs, content, files ya payloads nahi dikhte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClientHello ka SNI aam taur par visible; TLS 1.3 certificate chhupata hai.</li>
<li>Decrypt kiye bina FortiGate sirf addresses, ports, SNI aur handshake details dekhta hai.</li>
<li>Trust site certificate se intermediate se trusted root tak ki chain hai.</li>
<li>Deep inspection isliye chalta hai kyunki clients FortiGate CA par trust karte hain.</li>
<li>Sniffer aur session table encrypted payload kabhi nahi dikhate.</li>
</ul></div>
`}};export{e as default};