var e={id:`firewalls-ips`,h:{en:`Firewalls, NGFW, IDS and IPS`,hi:`Firewalls, NGFW, IDS aur IPS`},body:{en:`
<p>Picture the security desk of an office tower. A <b>stateless</b> guard has a list: "people with a blue badge may enter". He checks every person against the list and remembers nothing. A <b>stateful</b> guard also keeps a visitor book: when an employee walks out to fetch lunch, the guard writes it down and lets the same person back in without re-checking the list. A <b>next-generation</b> guard also opens the lunch box. That is the whole story of firewalls in three sentences.</p>

<h3>Stateless packet filtering</h3>
<p>A <b>stateless</b> filter, such as a router ACL, looks at each packet on its own: source and destination IP, protocol, ports. It keeps no memory of connections. To let internal users browse the web, a stateless ACL must also permit the <b>return</b> traffic from any web server to high ports on inside hosts, which leaves a wide hole. Stateless filters are fast and perfect for simple jobs such as protecting a router's VTY lines or dropping spoofed sources at the edge.</p>

<h3>Stateful firewalls</h3>
<p>A <b>stateful</b> firewall tracks every connection in a <b>connection (state) table</b>: addresses, ports, TCP state, idle timer. Only the first packet of a flow is checked against the policy; return packets that match an existing entry are allowed automatically, and unsolicited inbound packets are dropped. This is how "inside can start connections to the internet, the internet cannot start connections inside" works with very few rules.</p>
<pre class="out">ASA# show conn
3 in use, 118 most used
<span class="hl">TCP outside  203.0.113.80:443 inside  10.10.10.100:51514, idle 0:00:04, bytes 53211, flags UIO</span>
UDP outside  198.51.100.53:53 inside  10.10.10.100:61022, idle 0:00:01, bytes 142, flags -
TCP dmz  10.20.0.10:443 outside  198.51.100.77:40122, idle 0:00:12, bytes 8120, flags UIOB</pre>
<p>The highlighted line is a web session started by an inside PC; the firewall will accept the server's replies because they match this entry.</p>

<h3>Zones and the DMZ</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Firewall zones inside, outside and DMZ">
<rect x="250" y="80" width="140" height="60" rx="10" fill="#fed7aa"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">stateful / NGFW</text>
<rect x="10" y="80" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="90" y="106" text-anchor="middle" class="svg-ink" font-size="13">Inside</text><text x="90" y="124" text-anchor="middle" class="svg-muted" font-size="12">staff, 10.10.0.0/16</text>
<rect x="470" y="80" width="160" height="60" rx="10" fill="#e2e8f0"/><text x="550" y="106" text-anchor="middle" class="svg-ink" font-size="13">Outside</text><text x="550" y="124" text-anchor="middle" class="svg-muted" font-size="12">internet</text>
<rect x="240" y="170" width="160" height="44" rx="10" fill="#bae6fd"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="13">DMZ: web, mail</text>
<line x1="170" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">Inside to outside: allowed, returns tracked. Outside to inside: denied.</text>
<text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">Outside to DMZ: only the published services.</text>
</svg><p class="cap">Three zones: public servers sit in the DMZ so a compromise there does not expose the inside network.</p></div>
<p>Firewalls group interfaces into <b>security zones</b> and write policy between zones. The classic design has <b>inside</b> (trusted), <b>outside</b> (internet) and a <b>DMZ</b> (demilitarised zone) for servers the public must reach. If the web server in the DMZ is compromised, the attacker still faces the firewall before reaching the inside. On Cisco ASA, interfaces have security levels from 0 (outside) to 100 (inside), and traffic from higher to lower is allowed by default.</p>

<h3>Next-generation firewalls (NGFW)</h3>
<p>Blueprint item 1.1 asks you to describe the role of NGFW and IPS. An <b>NGFW</b> is a stateful firewall plus deeper inspection:</p>
<ul>
<li><b>Application visibility and control</b>: recognises applications (a video platform, a file-sharing app) regardless of port, so "block file sharing" works even if it runs on TCP 443.</li>
<li><b>Integrated IPS</b>: inspects content for known attack signatures.</li>
<li><b>URL filtering</b> by category and reputation.</li>
<li><b>Advanced malware protection</b>: checks files against reputation databases and can sandbox unknown files.</li>
<li><b>User identity</b>: rules by user or group from the directory, not only by IP.</li>
<li><b>TLS decryption</b> (optional) so encrypted traffic can be inspected, within privacy policy.</li>
</ul>
<p>Cisco's current family is Cisco Secure Firewall (running Firepower Threat Defense software); other vendors have equivalent products.</p>

<h3>IDS versus IPS</h3>
<table class="cmp"><tr><th></th><th>IDS (intrusion detection)</th><th>IPS (intrusion prevention)</th></tr>
<tr><td>Placement</td><td>Out of band: receives a copy of traffic (SPAN port or TAP)</td><td>Inline: traffic passes through it</td></tr>
<tr><td>Action</td><td>Alerts only; the attack packet already passed</td><td>Drops or resets the malicious traffic in real time</td></tr>
<tr><td>Risk if it fails</td><td>No impact on traffic</td><td>Can block traffic (fail-open or fail-closed choice) and adds latency</td></tr></table>
<p>Detection methods: <b>signature-based</b> matches known attack patterns (accurate for known threats, blind to new ones) and <b>anomaly/behaviour-based</b> compares against a normal baseline (can catch new attacks but produces more false positives). A <b>false positive</b> is an alert on legitimate traffic; a <b>false negative</b> is a real attack that was missed, which is worse.</p>

<div class="eg"><p><b>Worked example.</b> A company needs: staff browse the internet; the public reaches the web server 10.20.0.10 on TCP 443 only; block peer-to-peer apps whatever port they use; stop known exploit attempts against the web server. Design: stateful NGFW with inside, outside and DMZ; allow inside to outside; allow outside to 10.20.0.10 TCP 443 only (via static NAT from a public address such as 203.0.113.20); application control rule blocking the P2P category; IPS policy on the outside-to-DMZ rule.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing "permit ip any any" between zones "temporarily". (2) Placing public servers on the inside network with a port forward instead of in a DMZ. (3) Deploying an IPS inline in blocking mode on day one without tuning, then blocking a business application on a false positive. (4) Thinking a stateless ACL gives the same protection as a stateful firewall.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stateful = tracks sessions and allows return traffic automatically. IDS = passive copy, alert only; IPS = inline, can drop. NGFW = stateful plus application awareness, IPS, URL filtering, malware protection and identity. A false negative is a missed attack.</p></div>

<div class="scn"><h4>The ACL that let everything back in</h4><p>A small college protected its campus with an edge router ACL only. To make web browsing work, an engineer had permitted all TCP from any source port 80 or 443 to the inside network. During a security assessment, a tester reached an internal file server simply by sending traffic with source port 443. The college replaced the ACL with a stateful NGFW: inside users could start sessions, returns were tracked in the state table, unsolicited inbound traffic was dropped, and the student web portal moved into a DMZ with IPS inspection.</p><p><b>Lesson:</b> a stateless filter cannot tell a reply from an attack that looks like a reply. Use stateful inspection at the perimeter.</p></div>

<div class="iv"><p class="q">"What is the difference between a stateful firewall and a next-generation firewall, and between IDS and IPS?"</p><p>Strong answer: a stateful firewall tracks connections in a state table and allows return traffic automatically, filtering on addresses, ports and session state. An NGFW adds application visibility and control, integrated IPS, URL filtering, malware protection and user identity. IDS receives a copy of traffic and only alerts; IPS sits inline and can drop in real time, at the cost of latency and risk of blocking on false positives. Mention placement in a DMZ design and tuning before enforcement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stateless filters (ACLs) check each packet alone; stateful firewalls track sessions and auto-allow returns.</li>
<li>Zones: inside, outside and DMZ; public servers belong in the DMZ.</li>
<li>NGFW = stateful + application control + IPS + URL filtering + malware protection + identity.</li>
<li>IDS is passive and alerts; IPS is inline and blocks.</li>
<li>Signature detection misses new attacks; anomaly detection raises more false positives.</li>
</ul></div>
`,hi:`
<p>Ek office tower ka security desk socho. <b>Stateless</b> guard ke paas ek list hai: "blue badge wale andar aa sakte hain". Woh har insaan ko list se check karta hai aur kuch yaad nahi rakhta. <b>Stateful</b> guard ek visitor book bhi rakhta hai: jab employee lunch lene bahar jaata hai, guard likh leta hai aur usi insaan ko bina list dobara check kiye andar aane deta hai. <b>Next-generation</b> guard lunch box bhi khol kar dekhta hai. Firewalls ki poori kahani teen sentences mein yahi hai.</p>

<h3>Stateless packet filtering</h3>
<p><b>Stateless</b> filter, jaise router ACL, har packet ko akele dekhta hai: source aur destination IP, protocol, ports. Connections ki koi yaad nahi rakhta. Internal users ko web browse karwane ke liye stateless ACL ko kisi bhi web server se inside hosts ke high ports tak <b>return</b> traffic bhi permit karna padta hai, jo ek bada ched chhod deta hai. Stateless filters tez hain aur simple kaamon ke liye perfect, jaise router ki VTY lines protect karna ya edge par spoofed sources drop karna.</p>

<h3>Stateful firewalls</h3>
<p><b>Stateful</b> firewall har connection ko ek <b>connection (state) table</b> mein track karta hai: addresses, ports, TCP state, idle timer. Flow ka sirf pehla packet policy se check hota hai; jo return packets existing entry se match karte hain woh apne aap allow hote hain, aur bina maange aaye inbound packets drop hote hain. "Inside internet tak connections shuru kar sakta hai, internet andar connections shuru nahi kar sakta" bahut kam rules mein aise hi kaam karta hai.</p>
<pre class="out">ASA# show conn
3 in use, 118 most used
<span class="hl">TCP outside  203.0.113.80:443 inside  10.10.10.100:51514, idle 0:00:04, bytes 53211, flags UIO</span>
UDP outside  198.51.100.53:53 inside  10.10.10.100:61022, idle 0:00:01, bytes 142, flags -
TCP dmz  10.20.0.10:443 outside  198.51.100.77:40122, idle 0:00:12, bytes 8120, flags UIOB</pre>
<p>Highlighted line ek inside PC ka shuru kiya web session hai; firewall server ke replies accept karega kyunki woh is entry se match karte hain.</p>

<h3>Zones aur DMZ</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Firewall zones inside, outside aur DMZ">
<rect x="250" y="80" width="140" height="60" rx="10" fill="#fed7aa"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">stateful / NGFW</text>
<rect x="10" y="80" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="90" y="106" text-anchor="middle" class="svg-ink" font-size="13">Inside</text><text x="90" y="124" text-anchor="middle" class="svg-muted" font-size="12">staff, 10.10.0.0/16</text>
<rect x="470" y="80" width="160" height="60" rx="10" fill="#e2e8f0"/><text x="550" y="106" text-anchor="middle" class="svg-ink" font-size="13">Outside</text><text x="550" y="124" text-anchor="middle" class="svg-muted" font-size="12">internet</text>
<rect x="240" y="170" width="160" height="44" rx="10" fill="#bae6fd"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="13">DMZ: web, mail</text>
<line x1="170" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">Inside se outside: allowed, returns track hote hain. Outside se inside: denied.</text>
<text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">Outside se DMZ: sirf published services.</text>
</svg><p class="cap">Teen zones: public servers DMZ mein rehte hain taaki wahan compromise hone par inside network expose na ho.</p></div>
<p>Firewalls interfaces ko <b>security zones</b> mein group karte hain aur zones ke beech policy likhte hain. Classic design mein <b>inside</b> (trusted), <b>outside</b> (internet) aur un servers ke liye <b>DMZ</b> (demilitarised zone) hota hai jin tak public ko pahunchna hai. Agar DMZ ka web server compromise ho jaaye, attacker ko inside tak pahunchne se pehle phir bhi firewall ka saamna karna padta hai. Cisco ASA par interfaces ke security levels 0 (outside) se 100 (inside) tak hote hain, aur higher se lower ki taraf traffic default mein allowed hai.</p>

<h3>Next-generation firewalls (NGFW)</h3>
<p>Blueprint item 1.1 aapse NGFW aur IPS ka role describe karne ko kehta hai. <b>NGFW</b> ek stateful firewall plus gehra inspection hai:</p>
<ul>
<li><b>Application visibility and control</b>: applications (video platform, file-sharing app) ko port se farak pade bina pehchanta hai, isliye "file sharing block karo" TCP 443 par chalne par bhi kaam karta hai.</li>
<li><b>Integrated IPS</b>: content ko known attack signatures ke liye inspect karta hai.</li>
<li>Category aur reputation ke hisaab se <b>URL filtering</b>.</li>
<li><b>Advanced malware protection</b>: files ko reputation databases se check karta hai aur anjaan files ko sandbox kar sakta hai.</li>
<li><b>User identity</b>: directory se user ya group ke hisaab se rules, sirf IP se nahi.</li>
<li><b>TLS decryption</b> (optional) taaki encrypted traffic inspect ho sake, privacy policy ke andar.</li>
</ul>
<p>Cisco ki current family Cisco Secure Firewall hai (Firepower Threat Defense software chalane wali); doosre vendors ke equivalent products hain.</p>

<h3>IDS vs IPS</h3>
<table class="cmp"><tr><th></th><th>IDS (intrusion detection)</th><th>IPS (intrusion prevention)</th></tr>
<tr><td>Placement</td><td>Out of band: traffic ki copy milti hai (SPAN port ya TAP)</td><td>Inline: traffic isse hokar guzarta hai</td></tr>
<tr><td>Action</td><td>Sirf alert; attack packet pehle hi nikal chuka</td><td>Malicious traffic ko real time mein drop ya reset karta hai</td></tr>
<tr><td>Fail hone ka risk</td><td>Traffic par koi asar nahi</td><td>Traffic block kar sakta hai (fail-open ya fail-closed choice) aur latency jodta hai</td></tr></table>
<p>Detection methods: <b>signature-based</b> known attack patterns match karta hai (known threats ke liye accurate, naye threats ke liye andha) aur <b>anomaly/behaviour-based</b> normal baseline se compare karta hai (naye attacks pakad sakta hai lekin zyada false positives deta hai). <b>False positive</b> legitimate traffic par alert hai; <b>false negative</b> woh asli attack hai jo miss ho gaya, jo zyada bura hai.</p>

<div class="eg"><p><b>Worked example.</b> Company ko chahiye: staff internet browse kare; public web server 10.20.0.10 tak sirf TCP 443 par pahunche; peer-to-peer apps block hon chahe woh koi bhi port use karein; web server ke khilaf known exploit attempts rukein. Design: inside, outside aur DMZ ke saath stateful NGFW; inside se outside allow; outside se 10.20.0.10 sirf TCP 443 allow (203.0.113.20 jaise public address se static NAT ke through); P2P category block karne wala application control rule; outside-to-DMZ rule par IPS policy.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Zones ke beech "temporarily" "permit ip any any" likhna. (2) Public servers ko DMZ ki jagah port forward ke saath inside network par rakhna. (3) Pehle hi din bina tuning ke IPS ko inline blocking mode mein deploy karna, aur phir false positive par business application block kar dena. (4) Sochna ki stateless ACL stateful firewall jitna hi protection deti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stateful = sessions track karta hai aur return traffic apne aap allow karta hai. IDS = passive copy, sirf alert; IPS = inline, drop kar sakta hai. NGFW = stateful plus application awareness, IPS, URL filtering, malware protection aur identity. False negative miss hua attack hai.</p></div>

<div class="scn"><h4>ACL jisne sab kuch wapas andar aane diya</h4><p>Ek chhote college ne apne campus ko sirf edge router ACL se protect kiya tha. Web browsing chalane ke liye ek engineer ne kisi bhi source port 80 ya 443 se inside network tak saara TCP permit kar diya tha. Security assessment ke dauraan ek tester sirf source port 443 ke saath traffic bhej kar internal file server tak pahunch gaya. College ne ACL ki jagah stateful NGFW lagaya: inside users sessions shuru kar sakte the, returns state table mein track hote the, bina maange inbound traffic drop hota tha, aur student web portal IPS inspection ke saath DMZ mein shift hua.</p><p><b>Seekh:</b> stateless filter reply aur reply jaise dikhne wale attack mein farak nahi kar sakta. Perimeter par stateful inspection use karo.</p></div>

<div class="iv"><p class="q">"Stateful firewall aur next-generation firewall mein, aur IDS aur IPS mein kya farak hai?"</p><p>Strong answer: stateful firewall connections ko state table mein track karta hai aur return traffic apne aap allow karta hai, addresses, ports aur session state par filter karta hai. NGFW application visibility and control, integrated IPS, URL filtering, malware protection aur user identity jodta hai. IDS ko traffic ki copy milti hai aur woh sirf alert karta hai; IPS inline baithta hai aur real time mein drop kar sakta hai, latency aur false positives par block karne ke risk ki keemat par. DMZ design mein placement aur enforcement se pehle tuning ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stateless filters (ACLs) har packet akele check karte hain; stateful firewalls sessions track karte hain aur returns apne aap allow karte hain.</li>
<li>Zones: inside, outside aur DMZ; public servers DMZ mein hone chahiye.</li>
<li>NGFW = stateful + application control + IPS + URL filtering + malware protection + identity.</li>
<li>IDS passive hai aur alert karta hai; IPS inline hai aur block karta hai.</li>
<li>Signature detection naye attacks miss karta hai; anomaly detection zyada false positives deta hai.</li>
</ul></div>
`}};export{e as default};