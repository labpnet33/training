var e={id:`client-connector`,h:{en:`Client connector, trusted networks and bypass lists`,hi:`Client connector, trusted networks aur bypass lists`},body:{en:`
<h3>The agent for people who move</h3>
<p>Tunnels and PAC files protect a <i>place</i>. But vikram works from home on his own broadband, and ravi carries his laptop between Pune and a client site. A <b>client connector</b> is a small program installed on the device that forwards that device's traffic to the cloud service wherever it is. It needs three things at once: it is <b>installed</b>, the user is <b>signed in</b> (with SAML single sign-on, covered in module zs-id), and it is <b>running</b>. If any one is false, the device falls back to the site method or goes direct.</p>
<pre class="out">C:\\&gt; zapp status
Client connector: installed   signed in: vikram   state: enabled
Network: off-trusted   Action: tunnel
C:\\&gt; zapp update-policy
Policy refreshed.</pre>
<p>Useful commands: <code>zapp status</code>, <code>zapp login vikram</code>, <code>zapp logout</code>, <code>zapp disable</code>, <code>zapp enable</code>, <code>zapp update-policy</code>.</p>

<h3>Trusted network detection</h3>
<p>Inside the Pune office the laptop already has the office tunnel. Sending its traffic through a second tunnel would be wasteful and, as you will see, would change which rules match. So the connector first asks: <b>am I on a trusted network?</b> The simple test in this simulator is the device's <b>DNS suffix</b>. If it equals the trusted value in the profile (<code>ad.sahyadri.example</code>), the laptop is on the trusted network. The profile then has two actions: <b>on trusted</b> and <b>off trusted</b>, each either <code>tunnel</code> or <code>none</code>. Sahyadri's design is: on trusted <code>none</code> (the site tunnel handles it), off trusted <code>tunnel</code>.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Trusted network decision">
<rect x="10" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="102" text-anchor="middle" class="svg-ink" font-size="12">Laptop starts</text><text x="75" y="118" text-anchor="middle" class="svg-muted" font-size="12">reads DNS suffix</text>
<rect x="190" y="80" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="265" y="102" text-anchor="middle" class="svg-ink" font-size="12">suffix equals</text><text x="265" y="118" text-anchor="middle" class="svg-ink" font-size="12">trusted value?</text>
<rect x="400" y="15" width="230" height="70" rx="8" fill="#bbf7d0"/><text x="515" y="40" text-anchor="middle" class="svg-ink" font-size="12">Yes: on trusted = none</text><text x="515" y="60" text-anchor="middle" class="svg-muted" font-size="12">site tunnel handles it</text><text x="515" y="76" text-anchor="middle" class="svg-muted" font-size="12">location stays Pune HQ</text>
<rect x="400" y="130" width="230" height="75" rx="8" fill="#fed7aa"/><text x="515" y="155" text-anchor="middle" class="svg-ink" font-size="12">No: off trusted = tunnel</text><text x="515" y="175" text-anchor="middle" class="svg-muted" font-size="12">client tunnel, location remote</text><text x="515" y="191" text-anchor="middle" class="svg-muted" font-size="12">office-only rules do not match</text>
<line x1="140" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="340" y1="95" x2="400" y2="60" stroke="#64748b" stroke-width="2"/><line x1="340" y1="115" x2="400" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The DNS suffix decides which profile action applies.</p></div>
<p>Why does the location matter? When traffic comes through the client tunnel, the cloud labels its location as <b>remote</b>, not Pune HQ. Any rule scoped to the Pune HQ location does not match. This is a surprise ticket cause.</p>

<h3>Bypass lists: deliberate holes</h3>
<p>The profile has <b>bypass domains</b> and <b>bypass IPs</b>: traffic to them leaves the laptop directly instead of through the connector. Reasons are real: a printer on the home LAN, a video app that breaks when proxied, or a corporate name that must resolve locally. Each entry is a <b>hole</b> in the security design: no policy, no inspection, no logs. Rules for bypass entries: keep the list short, name exact hosts not whole domains, write why in the change log, and review it every quarter.</p>
<p>Two special effects. <b>Non-web traffic</b> sent through the client tunnel (not only browsers) is checked by the <b>cloud firewall</b>: the seed rules block tcp 22 and tcp 3389 and allow udp 53, so an SSH test to 203.0.113.200 from a laptop is blocked there, which differs from the PAC site where the same test dies at the edge. And <b>private access</b>: a corporate domain on the bypass list never reaches the private-access service at all, so the application is unreachable (module zs-zpa explains why).</p>
<pre class="out">Forwarding  &gt;  Client connector profile
Trusted network (DNS suffix): ad.sahyadri.example
On trusted: none      Off trusted: tunnel      Private access: on
Bypass domains: (none)
Bypass IPs: (none)</pre>

<h3>Troubleshooting by method: tickets 321050 and 321080</h3>
<p><b>321050, Pune laptops go through the client tunnel and the office rule no longer matches.</b> Symptom: Finance staff in the Pune office are blocked by a rule that was meant to allow Finance only at Pune HQ; logs show location remote. Evidence: <code>ipconfig</code> shows DNS suffix ad.sahyadri.example while the profile's trusted value has a typo; <code>zapp status</code> reports off-trusted, action tunnel. Root cause: the trusted criteria do not match, so the connector thinks it is off the office network. Fix: correct the trusted value to ad.sahyadri.example, Activate, <code>zapp update-policy</code> on a laptop. Verify: <code>zapp status</code> shows trusted, <code>curl</code> shows path tunnel from the site and location Pune HQ in the log.</p>
<p><b>321080, a remote user cannot reach the ERP.</b> Symptom: vikram gets a failed connection for erp.corp.example. Evidence: <code>zapp status</code> is fine; the private-access test says the domain is bypassed; the profile bypass list contains corp.example. Root cause: a bypass entry for the corporate domain. Fix: remove it (or narrow it to the one non-ERP host that really needs it), Activate, <code>zapp update-policy</code>. Verify: the ERP opens and the private-access log names the allowing rule.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Trusted network and the two actions decide whether the device uses its own tunnel; the client tunnel changes the location the cloud assigns (remote) and so which rules match. A bypass entry makes that traffic leave straight from the device, so nothing in the cloud sees it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) A typo in the trusted DNS suffix. (2) Bypassing a whole domain for one broken host. (3) Forgetting <code>zapp update-policy</code> after a profile change. (4) Assuming the connector works while signed out. (5) Expecting a bypass list to be harmless.</p></div>
<div class="exam"><p><b>Exam trap.</b> Trusted network detection here is by DNS suffix. A client-tunnel request has location remote, so rules scoped to an office location do not match.</p></div>

<div class="scn"><h4>The quarterly bypass review</h4><p>An audit found fourteen bypass entries, three of them whole domains added "temporarily" by help-desk staff. One of them covered the corporate domain, which would have silently broken private access for travellers. The team cut the list to four exact hosts, each with an owner and an expiry date.</p><p><b>Lesson:</b> every bypass is a hole with an owner or it is a risk without one.</p></div>

<div class="iv"><p class="q">"Why does the client connector need trusted network detection?"</p><p>Strong answer: to avoid double tunnelling when the user is already behind the office tunnel, and to apply the right policy at home versus in the office. Explain the DNS-suffix test, the on-trusted and off-trusted actions, the effect on location, and the risks of bypass entries.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The connector must be installed, signed in and running.</li>
<li>Trusted network: DNS suffix equal to the profile's trusted value.</li>
<li>Client tunnel makes location remote; office-scoped rules stop matching.</li>
<li>Bypass lists are holes: no policy, no inspection, no logs.</li>
<li>Non-web traffic through the client is judged by the cloud firewall.</li>
</ul></div>
`,hi:`
<h3>Chalte-phirte logon ke liye agent</h3>
<p>Tunnels aur PAC files ek <i>jagah</i> ko protect karte hain. Lekin vikram ghar se apne broadband par kaam karta hai, aur ravi apna laptop Pune aur client site ke beech le jaata hai. <b>Client connector</b> device par install hone wala chhota program hai jo us device ka traffic cloud service tak forward karta hai, chahe woh kahin bhi ho. Use teen cheezein ek saath chahiye: woh <b>installed</b> ho, user <b>signed in</b> ho (SAML single sign-on se, module zs-id mein), aur woh <b>running</b> ho. Inme se ek bhi false ho to device site method par ya direct chala jaata hai.</p>
<pre class="out">C:\\&gt; zapp status
Client connector: installed   signed in: vikram   state: enabled
Network: off-trusted   Action: tunnel
C:\\&gt; zapp update-policy
Policy refreshed.</pre>
<p>Kaam ke commands: <code>zapp status</code>, <code>zapp login vikram</code>, <code>zapp logout</code>, <code>zapp disable</code>, <code>zapp enable</code>, <code>zapp update-policy</code>.</p>

<h3>Trusted network detection</h3>
<p>Pune office ke andar laptop ke paas pehle se office tunnel hai. Uska traffic doosre tunnel se bhejna wasteful hoga aur, jaise aap dekhoge, kaun se rules match karenge woh badal dega. Isliye connector pehle poochta hai: <b>kya main trusted network par hoon?</b> Is simulator mein simple test device ka <b>DNS suffix</b> hai. Agar woh profile ki trusted value (<code>ad.sahyadri.example</code>) ke barabar hai to laptop trusted network par hai. Phir profile ke do actions hain: <b>on trusted</b> aur <b>off trusted</b>, har ek ya to <code>tunnel</code> ya <code>none</code>. Sahyadri ka design: on trusted <code>none</code> (site tunnel sambhalta hai), off trusted <code>tunnel</code>.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Trusted network decision">
<rect x="10" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="102" text-anchor="middle" class="svg-ink" font-size="12">Laptop start</text><text x="75" y="118" text-anchor="middle" class="svg-muted" font-size="12">DNS suffix padhta hai</text>
<rect x="190" y="80" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="265" y="102" text-anchor="middle" class="svg-ink" font-size="12">suffix trusted value</text><text x="265" y="118" text-anchor="middle" class="svg-ink" font-size="12">ke barabar?</text>
<rect x="400" y="15" width="230" height="70" rx="8" fill="#bbf7d0"/><text x="515" y="40" text-anchor="middle" class="svg-ink" font-size="12">Haan: on trusted = none</text><text x="515" y="60" text-anchor="middle" class="svg-muted" font-size="12">site tunnel sambhalta hai</text><text x="515" y="76" text-anchor="middle" class="svg-muted" font-size="12">location Pune HQ rehti hai</text>
<rect x="400" y="130" width="230" height="75" rx="8" fill="#fed7aa"/><text x="515" y="155" text-anchor="middle" class="svg-ink" font-size="12">Nahi: off trusted = tunnel</text><text x="515" y="175" text-anchor="middle" class="svg-muted" font-size="12">client tunnel, location remote</text><text x="515" y="191" text-anchor="middle" class="svg-muted" font-size="12">office-only rules match nahi</text>
<line x1="140" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="340" y1="95" x2="400" y2="60" stroke="#64748b" stroke-width="2"/><line x1="340" y1="115" x2="400" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">DNS suffix decide karta hai ki kaun sa profile action lagega.</p></div>
<p>Location kyun matter karti hai? Jab traffic client tunnel se aata hai, cloud uski location <b>remote</b> label karta hai, Pune HQ nahi. Pune HQ location se scoped koi bhi rule match nahi karta. Yeh ticket ki surprise cause hai.</p>

<h3>Bypass lists: jaanboojh kar bane holes</h3>
<p>Profile mein <b>bypass domains</b> aur <b>bypass IPs</b> hote hain: unka traffic connector se jaane ki jagah laptop se seedha nikalta hai. Wajahen asli hoti hain: ghar ke LAN par printer, video app jo proxy hone par toot jaati hai, ya corporate naam jo locally resolve hona chahiye. Har entry security design mein ek <b>hole</b> hai: koi policy nahi, koi inspection nahi, koi logs nahi. Bypass entries ke niyam: list chhoti rakho, poore domains ki jagah exact hosts likho, change log mein wajah likho, aur har quarter review karo.</p>
<p>Do special effects. Client tunnel se bheja gaya <b>non-web traffic</b> (sirf browsers nahi) <b>cloud firewall</b> se check hota hai: seed rules tcp 22 aur tcp 3389 block karte hain aur udp 53 allow karte hain, to laptop se 203.0.113.200 par SSH test wahan block hota hai, jabki PAC site par wahi test edge par dam todta hai. Aur <b>private access</b>: bypass list par corporate domain private-access service tak kabhi pahunchta hi nahi, to application unreachable ho jaati hai (module zs-zpa batata hai kyun).</p>
<pre class="out">Forwarding  &gt;  Client connector profile
Trusted network (DNS suffix): ad.sahyadri.example
On trusted: none      Off trusted: tunnel      Private access: on
Bypass domains: (none)
Bypass IPs: (none)</pre>

<h3>Method se troubleshooting: tickets 321050 aur 321080</h3>
<p><b>321050, Pune laptops client tunnel se jaate hain aur office rule ab match nahi karta.</b> Symptom: Pune office ke Finance staff ko woh rule block karta hai jo sirf Pune HQ par Finance ko allow karne ke liye tha; logs location remote dikhate hain. Evidence: <code>ipconfig</code> DNS suffix ad.sahyadri.example dikhata hai jabki profile ki trusted value mein typo hai; <code>zapp status</code> off-trusted, action tunnel report karta hai. Root cause: trusted criteria match nahi karte, to connector sochta hai ki woh office network par nahi hai. Fix: trusted value ko ad.sahyadri.example sahi karo, Activate, laptop par <code>zapp update-policy</code>. Verify: <code>zapp status</code> trusted dikhata hai, <code>curl</code> site se path tunnel dikhata hai aur log mein location Pune HQ.</p>
<p><b>321080, remote user ERP tak nahi pahunch pa raha.</b> Symptom: vikram ko erp.corp.example ke liye failed connection milta hai. Evidence: <code>zapp status</code> theek hai; private-access test kehta hai domain bypassed hai; profile bypass list mein corp.example hai. Root cause: corporate domain ki bypass entry. Fix: use hatao (ya sirf us ek non-ERP host tak narrow karo jise sach mein chahiye), Activate, <code>zapp update-policy</code>. Verify: ERP khulta hai aur private-access log allow karne wale rule ka naam dikhata hai.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Trusted network aur do actions decide karte hain ki device apna tunnel use karega ya nahi; client tunnel woh location badalta hai jo cloud assign karta hai (remote) aur isliye kaun se rules match karte hain. Bypass entry us traffic ko device se seedha nikalne deti hai, to cloud mein kuch use nahi dekhta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Trusted DNS suffix mein typo. (2) Ek broken host ke liye poora domain bypass karna. (3) Profile change ke baad <code>zapp update-policy</code> bhool jaana. (4) Signed out hone par bhi connector kaam karne ki ummeed. (5) Bypass list ko harmless samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yahan trusted network detection DNS suffix se hota hai. Client-tunnel request ki location remote hoti hai, to office location se scoped rules match nahi karte.</p></div>

<div class="scn"><h4>Quarterly bypass review</h4><p>Ek audit mein chaudah bypass entries mili, jinme teen poore domains help-desk staff ne "temporarily" add kiye the. Inme se ek corporate domain cover karta tha, jo travellers ke liye private access chupchaap tod deta. Team ne list chaar exact hosts tak kaat di, har ek ke owner aur expiry date ke saath.</p><p><b>Seekh:</b> har bypass ek hole hai jiska owner hona chahiye, warna woh bina owner ka risk hai.</p></div>

<div class="iv"><p class="q">"Client connector ko trusted network detection kyun chahiye?"</p><p>Strong answer: jab user pehle se office tunnel ke peeche ho to double tunnelling se bachne ke liye, aur ghar versus office mein sahi policy lagane ke liye. DNS-suffix test, on-trusted aur off-trusted actions, location par asar, aur bypass entries ke risks samjhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connector installed, signed in aur running hona chahiye.</li>
<li>Trusted network: DNS suffix profile ki trusted value ke barabar.</li>
<li>Client tunnel location remote bana deta hai; office-scoped rules match karna band.</li>
<li>Bypass lists holes hain: koi policy, inspection ya logs nahi.</li>
<li>Client se jaane wala non-web traffic cloud firewall se judge hota hai.</li>
</ul></div>
`}};export{e as default};