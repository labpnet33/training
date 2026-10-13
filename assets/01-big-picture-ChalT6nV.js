var e={id:`big-picture`,h:{en:`Welcome: why identity matters, and what you will learn`,hi:`Swagat: identity kyun zaroori hai, aur aap kya seekhoge`},body:{en:`

<p><b>What you will learn in this module.</b> You will learn how a Palo Alto Networks firewall learns <i>who</i> is behind an IP address (User-ID), how it reads group membership from the directory, how to write security rules for people and groups instead of addresses, and how GlobalProtect brings remote users into the same model through portals and gateways. This is the identity part of the Security Policy and App-ID area of the NGFW Engineer blueprint.</p>
<p><b>Prerequisites.</b> You should know zones, security rules and App-ID from the pan-policy module, and the basics of Active Directory and LDAP (users, groups, domain controllers). Basic certificate knowledge from sec-crypto helps for GlobalProtect.</p>
<div class="note"><p><b>Read this first.</b> <b>Honest scope of the lab.</b> The simulator for this track runs the PAN-OS-style CLI for zones, rules, sessions, counters and logs. It does not contain a directory, a User-ID agent or a GlobalProtect portal, so this module has <b>no labs of its own</b>. Where a command can be run, the output shown is real simulator output and says so. Everything else is labelled "Reference configuration (not run in the simulator)". Practise the surrounding skills in pan-policy and pan-diag, and the identity back ends in sec-aaa-mgmt and sec-ise.</p></div>

<h3>Analogy: visitor badges instead of seat numbers</h3>
<p>Imagine an office where the guard decides who may enter a room by the <b>seat number</b> of the visitor. That works until the visitor moves to another seat, or two people share a desk. Now imagine each visitor wears a <b>named badge</b>. The guard can say "engineers may enter the lab" and the rule keeps working wherever they sit. IP addresses are seat numbers. User-ID is the named badge.</p>

<h3>The problem User-ID solves</h3>
<p>Traditional firewall rules say "10.0.1.0/24 may reach the server". But laptops move between Wi-Fi, wired ports and VPN, DHCP changes addresses, and several people may share one terminal server. An address does not identify a person. Security teams want rules and logs that say <b>"user priya.s of the engineers group opened this application"</b>.</p>
<p>User-ID gives the firewall a table of <b>IP address to user name</b> mappings, plus a table of <b>user to group</b> memberships. Rules can then use users and groups, and logs show the user name.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="User-ID pieces"><rect x="20" y="25" width="129" height="80" rx="10" fill="#bae6fd"/><text x="84.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Mapping</text><text x="84.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">IP address to user</text><line x1="149" y1="65" x2="177" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="177,65 170,61 170,69" fill="#64748b"/><rect x="177" y="25" width="129" height="80" rx="10" fill="#bbf7d0"/><text x="241.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Group mapping</text><text x="241.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">user to groups</text><line x1="306" y1="65" x2="334" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="334,65 327,61 327,69" fill="#64748b"/><rect x="334" y="25" width="129" height="80" rx="10" fill="#ddd6fe"/><text x="398.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="398.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">rules use user/group</text><line x1="463" y1="65" x2="491" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="491,65 484,61 484,69" fill="#64748b"/><rect x="491" y="25" width="129" height="80" rx="10" fill="#fde68a"/><text x="555.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Logs</text><text x="555.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">SrcUser in every entry</text></svg><p class="cap">The four pieces of identity-based security.</p></div>

<h3>The three ideas you will build</h3>
<ol>
<li><b>User-ID mapping</b>: how an IP address becomes a user name (chapters 2 and 3).</li>
<li><b>Group mapping</b>: how the firewall learns who belongs to which group (chapter 4), and how rules use them (chapter 5).</li>
<li><b>GlobalProtect</b>: how remote users connect to a portal and a gateway, and how that login creates the mapping (chapters 6 and 7).</li>
</ol>
<p>Chapter 8 is the troubleshooting workflow and chapter 9 the exam checklist.</p>

<h3>What identity looks like in the lab</h3>
<p>The lab firewall <code>PA1</code> has no identity source, so every session shows an unknown user. This is exactly what a firewall without User-ID looks like, and it is the "before" picture you will compare against:</p>
<pre class="out">PA1&gt; show session id 9361
	c2s flow:
		source:      10.0.1.10 [trust]
		dst:         8.8.8.8
		sport:       64251           dport:      80
		state:       ACTIVE          type:       FLOW
		<span class="hl">src user:    unknown</span>
		<span class="hl">dst user:    unknown</span></pre>
<p>The traffic log has the same gap: the <code>SrcUser</code> column is empty in the lab, because no mapping exists for 10.0.1.10. With User-ID working, that line would show the domain and user name.</p>

<div class="eg"><p><b>Worked example.</b> A finance manager asks, "Who downloaded the payroll file from the share at 14:10?". With address-only logs you can say "10.0.5.77", and then you spend an hour matching DHCP leases. With User-ID, the log entry shows the user name directly, and the manager has the answer in a minute.</p></div>

<h3>Where User-ID fits in the packet path</h3>
<p>User-ID is looked up in the <b>zone of the source</b> when a session is created. That is why it is enabled per zone (you will do this in chapter 3). The security rule then compares the mapped user, and the user is stored in the session as <code>src user</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking a user rule works the moment you type it. A rule that names a user or group matches only when a <b>mapping exists</b> for the source IP. Unmapped traffic is "unknown" and skips the rule. Always check the mapping before you blame the rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> User-ID is enabled on the <b>source zone</b>, not on the rule and not on the interface. If a question asks where to enable it so that rules can match users coming from the trust zone, the answer is the trust zone.</p></div>

<div class="scn"><h4>The log that named a person</h4><p>A company investigated suspicious uploads. Their old firewall logged only addresses, and DHCP leases had expired. After deploying User-ID, the next incident log already carried the account name, the application and the rule. The investigation took ten minutes and no one was blamed wrongly.</p><p><b>Lesson:</b> Identity in the log turns an address into evidence.</p></div>

<div class="iv"><p class="q">"What is User-ID and why do we use it?"</p><p>User-ID maps IP addresses to user names and groups so that security rules, logs and reports use identity instead of addresses. Mapping comes from sources such as domain controller logs, GlobalProtect, captive portal, syslog and the XML API, and group membership is read from LDAP. It is enabled per source zone. I would add that rules naming users only match when a mapping exists.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User-ID maps IP to user and, with group mapping, user to group.</li>
<li>Rules and logs can then use people and groups instead of addresses.</li>
<li>It is enabled on the source zone.</li>
<li>GlobalProtect connects remote users and also creates user mappings.</li>
<li>This module has no simulator labs; real simulator output is labelled and everything else is reference.</li>
</ul></div>

`,hi:`

<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Palo Alto Networks firewall kaise pata karta hai ki IP address ke peeche <i>kaun</i> hai (User-ID), directory se group membership kaise padhta hai, addresses ke bajaye users aur groups ke liye security rules kaise likhte hain, aur GlobalProtect portals aur gateways ke zariye remote users ko isi model mein kaise laata hai. Yeh NGFW Engineer blueprint ke Security Policy and App-ID area ka identity hissa hai.</p>
<p><b>Prerequisites.</b> Aapko pan-policy module se zones, security rules aur App-ID pata hone chahiye, aur Active Directory aur LDAP ke basics (users, groups, domain controllers). GlobalProtect ke liye sec-crypto ka certificate knowledge madad karta hai.</p>
<div class="note"><p><b>Pehle yeh padho.</b> <b>Lab ka honest scope.</b> Is track ka simulator zones, rules, sessions, counters aur logs ke liye PAN-OS-style CLI chalata hai. Isme directory, User-ID agent ya GlobalProtect portal nahi hai, isliye is module ke <b>apne labs nahi hain</b>. Jahan command chal sakta hai, wahan dikhaya output asli simulator output hai aur likha hota hai. Baaki sab "Reference configuration (not run in the simulator)" label ke saath hai. Aas-paas ki skills pan-policy aur pan-diag mein, aur identity back ends sec-aaa-mgmt aur sec-ise mein practise karo.</p></div>

<h3>Analogy: seat number ke bajaye visitor badge</h3>
<p>Socho ek office jahan guard visitor ki <b>seat number</b> dekhkar decide karta hai ki kaunsa kamra khulega. Yeh tab tak chalta hai jab tak visitor doosri seat par na chala jaye, ya do log ek desk share na karein. Ab socho har visitor <b>naam wala badge</b> pehente hai. Guard keh sakta hai "engineers lab mein ja sakte hain" aur rule wahin chalti hai jahan bhi woh baithein. IP addresses seat numbers hain. User-ID naam wala badge hai.</p>

<h3>User-ID kaunsi problem solve karta hai</h3>
<p>Traditional firewall rules kehti hain "10.0.1.0/24 server tak ja sakta hai". Lekin laptops Wi-Fi, wired ports aur VPN ke beech ghoomte hain, DHCP addresses badalta hai, aur kai log ek terminal server share karte hain. Address kisi insaan ki pehchaan nahi hai. Security teams ko aisi rules aur logs chahiye jo kahein <b>"engineers group ke user priya.s ne yeh application kholi"</b>.</p>
<p>User-ID firewall ko <b>IP address se user name</b> mappings ka table deta hai, aur <b>user se group</b> memberships ka table. Rules ab users aur groups use kar sakti hain, aur logs mein user name dikhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="User-ID pieces"><rect x="20" y="25" width="129" height="80" rx="10" fill="#bae6fd"/><text x="84.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Mapping</text><text x="84.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">IP address se user</text><line x1="149" y1="65" x2="177" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="177,65 170,61 170,69" fill="#64748b"/><rect x="177" y="25" width="129" height="80" rx="10" fill="#bbf7d0"/><text x="241.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Group mapping</text><text x="241.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">user se groups</text><line x1="306" y1="65" x2="334" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="334,65 327,61 327,69" fill="#64748b"/><rect x="334" y="25" width="129" height="80" rx="10" fill="#ddd6fe"/><text x="398.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="398.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">rules mein user/group</text><line x1="463" y1="65" x2="491" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="491,65 484,61 484,69" fill="#64748b"/><rect x="491" y="25" width="129" height="80" rx="10" fill="#fde68a"/><text x="555.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Logs</text><text x="555.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">har entry mein SrcUser</text></svg><p class="cap">Identity-based security ke chaar hisse.</p></div>

<h3>Teen ideas jo aap banaoge</h3>
<ol>
<li><b>User-ID mapping</b>: IP address user name kaise banta hai (chapter 2 aur 3).</li>
<li><b>Group mapping</b>: firewall ko kaise pata chalta hai kaun kis group mein hai (chapter 4), aur rules inhe kaise use karti hain (chapter 5).</li>
<li><b>GlobalProtect</b>: remote users portal aur gateway se kaise jude, aur woh login mapping kaise banata hai (chapter 6 aur 7).</li>
</ol>
<p>Chapter 8 troubleshooting workflow hai aur chapter 9 exam checklist.</p>

<h3>Lab mein identity kaisi dikhti hai</h3>
<p>Lab firewall <code>PA1</code> ke paas koi identity source nahi hai, isliye har session mein user unknown dikhta hai. Bina User-ID ka firewall aisa hi dikhta hai, aur yahi "before" picture hai jisse aap compare karoge:</p>
<pre class="out">PA1&gt; show session id 9361
	c2s flow:
		source:      10.0.1.10 [trust]
		dst:         8.8.8.8
		sport:       64251           dport:      80
		state:       ACTIVE          type:       FLOW
		<span class="hl">src user:    unknown</span>
		<span class="hl">dst user:    unknown</span></pre>
<p>Traffic log mein bhi yahi gap hai: lab mein <code>SrcUser</code> column khaali hai, kyunki 10.0.1.10 ka koi mapping nahi. User-ID chalne par us jagah domain aur user name dikhta.</p>

<div class="eg"><p><b>Worked example.</b> Finance manager poochta hai, "14:10 par share se payroll file kisne download ki?". Sirf address wale logs mein aap "10.0.5.77" bata sakte ho, aur phir ek ghanta DHCP leases match karne mein jaata hai. User-ID ke saath log entry mein seedha user name hota hai, aur manager ko ek minute mein jawab mil jaata hai.</p></div>

<h3>Packet path mein User-ID kahan aata hai</h3>
<p>Session banate waqt User-ID <b>source ke zone</b> mein dekha jaata hai. Isi liye ise zone par enable karte hain (chapter 3 mein karoge). Security rule phir mapped user compare karti hai, aur user session mein <code>src user</code> ke roop mein store hota hai.</p>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki user rule type karte hi chalne lagti hai. Jo rule user ya group ka naam leti hai woh tabhi match karti hai jab source IP ka <b>mapping maujood</b> ho. Unmapped traffic "unknown" hai aur us rule ko skip karta hai. Rule ko dosh dene se pehle mapping check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> User-ID <b>source zone</b> par enable hota hai, rule par nahi aur interface par nahi. Sawaal poochhe ki trust zone se aane waale users par rules match karane ke liye kahan enable karein, to jawab trust zone hai.</p></div>

<div class="scn"><h4>Log jisne insaan ka naam bataya</h4><p>Ek company suspicious uploads investigate kar rahi thi. Purana firewall sirf addresses log karta tha, aur DHCP leases expire ho chuki thin. User-ID lagane ke baad agle incident ke log mein hi account name, application aur rule thi. Investigation das minute mein hui aur kisi ko galat blame nahi kiya gaya.</p><p><b>Lesson:</b> Log mein identity address ko evidence bana deti hai.</p></div>

<div class="iv"><p class="q">"User-ID kya hai aur hum ise kyun use karte hain?"</p><p>User-ID IP addresses ko user names aur groups se map karta hai taaki security rules, logs aur reports addresses ke bajaye identity use karein. Mapping domain controller logs, GlobalProtect, captive portal, syslog aur XML API jaise sources se aati hai, aur group membership LDAP se padhi jaati hai. Yeh source zone par enable hota hai. Jodunga ki users naam leti rules tabhi match karti hain jab mapping maujood ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User-ID IP ko user se, aur group mapping ke saath user ko group se map karta hai.</li>
<li>Rules aur logs addresses ke bajaye logon aur groups ko use kar sakte hain.</li>
<li>Yeh source zone par enable hota hai.</li>
<li>GlobalProtect remote users ko jodta hai aur user mappings bhi banata hai.</li>
<li>Is module mein simulator labs nahi hain; asli simulator output label ke saath aur baaki reference hai.</li>
</ul></div>

`}};export{e as default};