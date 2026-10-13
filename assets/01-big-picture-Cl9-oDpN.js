var e={id:`big-picture`,h:{en:`Welcome: the encrypted-traffic blind spot and what you will learn`,hi:`Swagat: encrypted traffic ka blind spot aur aap kya seekhoge`},body:{en:`

<p><b>What you will learn in this module.</b> You will learn why most internet traffic is encrypted, why that blinds a firewall, and how a Palo Alto Networks firewall can decrypt traffic, inspect it and re-encrypt it, in a controlled and lawful way. The module covers SSL Forward Proxy, SSL Inbound Inspection, SSH Proxy, certificates and trust, and decryption policy with its exclusions. This is part of the Security Policy and App-ID area of the NGFW Engineer blueprint.</p>
<p><b>Prerequisites.</b> You should know zones, security rules and App-ID from pan-policy, and the basics of certificates and TLS from sec-crypto. For troubleshooting, the sessions and counters from pan-diag help.</p>
<div class="note"><p><b>Read this first.</b> <b>Honest scope of the lab.</b> The simulator for this track has no TLS engine, no certificate store and no decryption rulebase, so this module has <b>no labs of its own</b>. Real simulator output appears only where a command exists (sessions, tests, logs), and it is labelled. All decryption configuration is shown as "Reference configuration (not run in the simulator)". Practise the policy skills in pan-policy and the troubleshooting skills in pan-diag; the TLS theory is in sec-crypto and the related Fortinet SSL material is in nse4-ssl.</p></div>

<h3>Analogy: sealed envelopes at a customs office</h3>
<p>Imagine a customs officer who must stop dangerous items, but every parcel arrives inside a sealed, opaque box. He can read the address on the outside but not what is inside. A criminal only needs to use a sealed box. The officer has two options: ignore boxes (blind), or ask for the boxes to be opened in front of him, check them, and reseal them. Decryption is the second option. It must be done openly, under a published policy, and never for parcels the law or common sense says to leave sealed.</p>

<h3>The problem</h3>
<p>The majority of web traffic today uses TLS (the "S" in HTTPS). Attackers know that. Malware downloads, command and control, and data theft often travel inside TLS. If the firewall cannot look inside, then its threat prevention, URL filtering by path, data filtering and detailed App-ID have little to work with. This is the <b>encrypted-traffic blind spot</b>.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Decryption in the middle"><rect x="20" y="25" width="181" height="80" rx="10" fill="#bae6fd"/><text x="110.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="110.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">wants a TLS site</text><line x1="201" y1="65" x2="229" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="229,65 222,61 222,69" fill="#64748b"/><rect x="229" y="25" width="181" height="80" rx="10" fill="#bbf7d0"/><text x="319.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="319.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">decrypts and inspects</text><line x1="410" y1="65" x2="438" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="438,65 431,61 431,69" fill="#64748b"/><rect x="438" y="25" width="181" height="80" rx="10" fill="#ddd6fe"/><text x="528.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Server</text><text x="528.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">real TLS site</text></svg><p class="cap">With decryption the firewall sits in the middle of two TLS sessions, one to each side.</p></div>

<h3>What the firewall sees without decryption</h3>
<p>Even without decryption the firewall sees some metadata: the addresses and ports, the server name in the TLS handshake (SNI), the certificate presented by the server, and the TLS version and cipher chosen. It identifies the application only as <code>ssl</code>. In the lab, a connection to port 443 shows exactly that:</p>
<pre class="out">PA1&gt; show session all filter application ssl
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
9361         <span class="hl">ssl</span>            ACTIVE  FLOW NS    10.0.1.10[64251]/trust/6  (203.0.113.2[60001])
vsys1                                          8.8.8.8[443]/untrust  (8.8.8.8[443])</pre>
<p>The application is <code>ssl</code>. Whatever web application runs inside is invisible. A rule can allow or deny "ssl", but it cannot tell a harmless page from a risky download.</p>
<p>The test command shows how that affects policy. A rule that lists web-browsing and ssl, with application-default service, matches an ssl flow on port 443, but a web-browsing flow on 443 does not match, because the default port for web-browsing is 80. Real simulator output:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443 application ssl
"Allow-Out; index: 1" {
        application/service [ ping dns web-browsing ssl ]/application-default;
        <span class="hl">action allow;</span>
}

PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443 application web-browsing
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>This is why you must design rules deliberately when you introduce decryption: after decryption the firewall may identify the inner application in addition to ssl.</p>

<h3>Three kinds of decryption</h3>
<table class="cmp"><tr><th>Type</th><th>Direction</th><th>Protects against</th></tr>
<tr><td>SSL Forward Proxy</td><td>Your users going out to the internet</td><td>Malware, phishing and data theft hidden in TLS</td></tr>
<tr><td>SSL Inbound Inspection</td><td>Internet users reaching your own servers</td><td>Attacks on your published services hidden in TLS</td></tr>
<tr><td>SSH Proxy</td><td>SSH in either direction</td><td>Tunnelling and misuse of SSH</td></tr>
</table>

<h3>Decryption is a responsibility, not just a feature</h3>
<p>Decrypting means the firewall can see personal and sensitive content. Responsible deployment has rules that you will meet in every chapter: get legal and HR approval, tell users in an acceptable-use policy, exclude categories such as financial services and health, restrict who can see decrypted data, protect the decryption certificate key as a crown jewel, and log the programme. Decryption is for defence, not curiosity.</p>

<div class="eg"><p><b>Worked example.</b> A company finds that 85 percent of its outbound traffic is TLS and that its sandbox and antivirus scan almost nothing. After a six-week project, with legal sign-off and a user notice, the firewall decrypts general web traffic from the staff zone, skips banking and health sites, and malware downloads from compromised sites begin to appear in the threat log.</p></div>

<div class="warn"><p><b>Common mistake.</b> Turning decryption on for everything on day one. Pinned applications break, privacy rules are violated, and the firewall CPU is overloaded. Start with a pilot group, a no-decrypt list and monitoring.</p></div>
<div class="exam"><p><b>Exam trap.</b> The three decryption types: SSL Forward Proxy (outbound), SSL Inbound Inspection (to your servers), SSH Proxy. Without decryption the application shows as ssl and only TLS metadata is visible.</p></div>

<div class="scn"><h4>The malware nobody could see</h4><p>A company had antivirus and threat prevention on all rules, but infections kept arriving. The logs showed a lot of application ssl and no threats. The team checked the traffic: almost all downloads were encrypted. After a pilot with forward proxy decryption for the staff zone, the threat log began to show blocked executables from a compromised advertising site.</p><p><b>Lesson:</b> Security profiles only work on traffic the firewall can read. Plan decryption wherever you need inspection.</p></div>

<div class="iv"><p class="q">"Why do we decrypt traffic on a firewall, and what are the trade-offs?"</p><p>Because most traffic is TLS, and without decryption the firewall sees only metadata and the application as ssl, so threat prevention, URL and data controls are largely blind. The trade-offs are CPU load, privacy and legal obligations, broken pinned applications and the risk of the decryption key. So I decrypt selectively, exclude sensitive categories, deploy gradually and protect the CA key.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most traffic is TLS; without decryption the firewall sees metadata and application ssl.</li>
<li>Types: SSL Forward Proxy, SSL Inbound Inspection, SSH Proxy.</li>
<li>Decryption must be lawful, announced, selective and logged.</li>
<li>This module has no simulator labs; real simulator output is labelled, the rest is reference.</li>
<li>Start with a pilot and an exclusion list.</li>
</ul></div>

`,hi:`

<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki zyadatar internet traffic encrypted kyun hota hai, woh firewall ko andha kyun kar deta hai, aur Palo Alto Networks firewall traffic ko decrypt, inspect aur re-encrypt kaise karta hai, controlled aur lawful tareeke se. Module SSL Forward Proxy, SSL Inbound Inspection, SSH Proxy, certificates aur trust, aur decryption policy ko unke exclusions ke saath cover karta hai. Yeh NGFW Engineer blueprint ke Security Policy and App-ID area ka hissa hai.</p>
<p><b>Prerequisites.</b> Aapko pan-policy se zones, security rules aur App-ID pata hone chahiye, aur sec-crypto se certificates aur TLS ke basics. Troubleshooting ke liye pan-diag ke sessions aur counters madad karte hain.</p>
<div class="note"><p><b>Pehle yeh padho.</b> <b>Lab ka honest scope.</b> Is track ke simulator mein TLS engine, certificate store ya decryption rulebase nahi hai, isliye is module ke <b>apne labs nahi hain</b>. Asli simulator output sirf wahan dikhta hai jahan command maujood hai (sessions, tests, logs), aur label hota hai. Saari decryption configuration "Reference configuration (not run in the simulator)" ke roop mein hai. Policy skills pan-policy mein aur troubleshooting skills pan-diag mein practise karo; TLS theory sec-crypto mein hai aur Fortinet ka SSL material nse4-ssl mein.</p></div>

<h3>Analogy: customs office ke sealed envelopes</h3>
<p>Socho ek customs officer jise khatarnak cheezein rokni hain, lekin har parcel sealed, opaque dabbe mein aata hai. Woh bahar ka pata padh sakta hai lekin andar kya hai nahi. Criminal ko bas sealed dabba chahiye. Officer ke paas do options hain: dabbon ko ignore karo (andha), ya dabbe apne saamne kholne ko kaho, check karo, aur dobara seal karo. Decryption doosra option hai. Yeh khulkar, published policy ke under honi chahiye, aur un parcels ke liye kabhi nahi jinhe kanoon ya common sense sealed chhodne ko kehta hai.</p>

<h3>Problem</h3>
<p>Aaj ka zyadatar web traffic TLS use karta hai (HTTPS ka "S"). Attackers yeh jaante hain. Malware downloads, command and control aur data theft aksar TLS ke andar jaate hain. Firewall andar nahi dekh sakta to uska threat prevention, path-level URL filtering, data filtering aur detailed App-ID ke paas kaam karne ko kuch nahi bachta. Yahi hai <b>encrypted-traffic blind spot</b>.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Decryption in the middle"><rect x="20" y="25" width="181" height="80" rx="10" fill="#bae6fd"/><text x="110.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="110.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">TLS site chahta hai</text><line x1="201" y1="65" x2="229" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="229,65 222,61 222,69" fill="#64748b"/><rect x="229" y="25" width="181" height="80" rx="10" fill="#bbf7d0"/><text x="319.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="319.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">decrypt aur inspect</text><line x1="410" y1="65" x2="438" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="438,65 431,61 431,69" fill="#64748b"/><rect x="438" y="25" width="181" height="80" rx="10" fill="#ddd6fe"/><text x="528.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Server</text><text x="528.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">asli TLS site</text></svg><p class="cap">Decryption ke saath firewall do TLS sessions ke beech mein hota hai, har taraf ek.</p></div>

<h3>Decryption ke bina firewall kya dekhta hai</h3>
<p>Decryption ke bina bhi firewall kuch metadata dekhta hai: addresses aur ports, TLS handshake mein server ka naam (SNI), server ka dikhaya certificate, aur chuna gaya TLS version aur cipher. Application sirf <code>ssl</code> pehchanta hai. Lab mein port 443 ka connection bilkul yahi dikhata hai:</p>
<pre class="out">PA1&gt; show session all filter application ssl
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
9361         <span class="hl">ssl</span>            ACTIVE  FLOW NS    10.0.1.10[64251]/trust/6  (203.0.113.2[60001])
vsys1                                          8.8.8.8[443]/untrust  (8.8.8.8[443])</pre>
<p>Application <code>ssl</code> hai. Andar kaunsi web application chal rahi hai woh dikhti nahi. Rule "ssl" allow ya deny kar sakti hai, lekin harmless page aur risky download mein fark nahi kar sakti.</p>
<p>Test command dikhata hai ki isse policy par kya asar padta hai. Jo rule web-browsing aur ssl list karti hai application-default service ke saath, woh port 443 ke ssl flow se match karti hai, lekin 443 par web-browsing flow match nahi karta, kyunki web-browsing ka default port 80 hai. Asli simulator output:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443 application ssl
"Allow-Out; index: 1" {
        application/service [ ping dns web-browsing ssl ]/application-default;
        <span class="hl">action allow;</span>
}

PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443 application web-browsing
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Isliye decryption lagate waqt rules jaanbujhkar design karo: decryption ke baad firewall ssl ke alawa andar ki application bhi pehchan sakta hai.</p>

<h3>Decryption ke teen prakaar</h3>
<table class="cmp"><tr><th>Type</th><th>Direction</th><th>Kisse bachata hai</th></tr>
<tr><td>SSL Forward Proxy</td><td>Aapke users internet ki taraf jaate hue</td><td>TLS mein chhupe malware, phishing aur data theft se</td></tr>
<tr><td>SSL Inbound Inspection</td><td>Internet users aapke apne servers tak aate hue</td><td>TLS mein chhupe aapki published services par attacks se</td></tr>
<tr><td>SSH Proxy</td><td>SSH kisi bhi direction mein</td><td>SSH ke tunnelling aur misuse se</td></tr>
</table>

<h3>Decryption zimmedaari hai, sirf feature nahi</h3>
<p>Decrypt karne ka matlab firewall personal aur sensitive content dekh sakta hai. Zimmedaar deployment ke niyam har chapter mein milenge: legal aur HR approval lo, acceptable-use policy mein users ko batao, financial services aur health jaisi categories exclude karo, decrypted data kaun dekh sakta hai restrict karo, decryption certificate key ko crown jewel ki tarah protect karo, aur programme log karo. Decryption defence ke liye hai, jigyasa ke liye nahi.</p>

<div class="eg"><p><b>Worked example.</b> Ek company dekhti hai ki uska 85 percent outbound traffic TLS hai aur uska sandbox aur antivirus lagbhag kuch scan nahi karte. Chhe hafte ke project ke baad, legal sign-off aur user notice ke saath, firewall staff zone ka general web traffic decrypt karta hai, banking aur health sites skip karta hai, aur compromised sites se malware downloads threat log mein dikhne lagte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle din sab kuch par decryption on kar dena. Pinned applications toot jaati hain, privacy rules ka ullanghan hota hai, aur firewall CPU overload hota hai. Pilot group, no-decrypt list aur monitoring se shuru karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen decryption types: SSL Forward Proxy (outbound), SSL Inbound Inspection (aapke servers tak), SSH Proxy. Decryption ke bina application ssl dikhti hai aur sirf TLS metadata dikhta hai.</p></div>

<div class="scn"><h4>Malware jo kisi ko dikha nahi</h4><p>Ek company ke har rule par antivirus aur threat prevention tha, phir bhi infections aate rahe. Logs mein bahut application ssl tha aur koi threat nahi. Team ne traffic dekha: lagbhag saare downloads encrypted the. Staff zone ke liye forward proxy decryption ke pilot ke baad threat log mein compromised advertising site se blocked executables dikhne lage.</p><p><b>Lesson:</b> Security profiles sirf us traffic par chalte hain jo firewall padh sakta hai. Jahan inspection chahiye wahan decryption plan karo.</p></div>

<div class="iv"><p class="q">"Firewall par traffic decrypt kyun karte hain, aur trade-offs kya hain?"</p><p>Kyunki zyadatar traffic TLS hai, aur decryption ke bina firewall sirf metadata aur application ssl dekhta hai, isliye threat prevention, URL aur data controls kaafi had tak andhe hote hain. Trade-offs hain CPU load, privacy aur legal obligations, toote pinned applications aur decryption key ka risk. Isliye main selectively decrypt karta hoon, sensitive categories exclude karta hoon, dheere dheere deploy karta hoon aur CA key protect karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyadatar traffic TLS hai; decryption ke bina firewall metadata aur application ssl dekhta hai.</li>
<li>Types: SSL Forward Proxy, SSL Inbound Inspection, SSH Proxy.</li>
<li>Decryption lawful, announced, selective aur logged honi chahiye.</li>
<li>Is module mein simulator labs nahi hain; asli simulator output label ke saath, baaki reference.</li>
<li>Pilot aur exclusion list se shuru karo.</li>
</ul></div>

`}};export{e as default};