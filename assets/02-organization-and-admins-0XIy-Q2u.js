var e={id:`org-admins`,h:{en:`Organization, admins and least privilege`,hi:`Organization, admins aur least privilege`},body:{en:`
<h3>The organization: the top of the tree</h3>
<p>Everything in a cloud-managed estate sits under one top-level container called the <b>organization</b>. Think of it as the company's account. Our company, Bharat Retail Co, is organization 1001. Under it live <b>networks</b> (one per site: Mumbai HQ, Bengaluru Branch, Delhi Branch), and under each network live <b>devices</b>. Settings that apply to the whole company (admin accounts, API access, the licence, templates) belong to the organization, not to a single site.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Organization tree">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Organization 1001</text>
<line x1="320" y1="50" x2="320" y2="75" stroke="#64748b" stroke-width="2"/><line x1="100" y1="75" x2="540" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="100" y1="75" x2="100" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="75" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="540" y1="75" x2="540" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="100" y="120" text-anchor="middle" class="svg-ink" font-size="13">Network: mum</text>
<rect x="240" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Network: blr</text>
<rect x="460" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="540" y="120" text-anchor="middle" class="svg-ink" font-size="13">Network: del</text>
<rect x="20" y="160" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="100" y="182" text-anchor="middle" class="svg-ink" font-size="12">MX-MUM, SW-MUM</text><text x="100" y="198" text-anchor="middle" class="svg-ink" font-size="12">AP-MUM</text>
<rect x="240" y="160" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="12">MX-BLR, SW-BLR</text><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="12">AP-BLR</text>
<rect x="460" y="160" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="540" y="182" text-anchor="middle" class="svg-ink" font-size="12">MX-DEL, SW-DEL</text><text x="540" y="198" text-anchor="middle" class="svg-ink" font-size="12">AP-DEL</text>
<line x1="100" y1="135" x2="100" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="135" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="540" y1="135" x2="540" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Organization, then networks, then devices. Admin accounts and API access sit at the top.</p></div>

<h3>Admins and roles</h3>
<p>An <b>administrator</b> (admin) is a person who logs in to the dashboard. Each admin gets a <b>privilege</b> (a role): what they may see and change, and where. The page for this is called <b>Admins and API</b>. A typical set of privileges is:</p>
<table class="cmp"><tr><th>Privilege</th><th>What the person can do</th><th>Example at Bharat Retail Co</th></tr>
<tr><td>Organization full</td><td>Read and change everything, including admins</td><td>Head of IT</td></tr>
<tr><td>Organization read-only</td><td>See everything, change nothing</td><td>Auditor, NOC viewer</td></tr>
<tr><td>Network full (one network)</td><td>Change only the networks they are scoped to</td><td>Bengaluru site engineer</td></tr>
<tr><td>Network read-only</td><td>View one network only</td><td>Bengaluru store manager</td></tr>
</table>
<p>The exact role names in a real product differ; check the vendor documentation. The idea is stable: a privilege is a <i>level</i> (full, read-only) combined with a <i>scope</i> (the whole organization or named networks).</p>

<h3>Least privilege: give the smallest key that does the job</h3>
<p><b>Least privilege</b> means every person gets only the access needed for their job and nothing more. Why? A mistake or a stolen password can only damage what that account could touch. If the Bengaluru engineer has full rights only on the <code>blr</code> network, a wrong click can never take down Mumbai. It also helps audits: the change log shows who did what, and a small list of full admins is easy to review.</p>
<div class="eg"><p><b>Worked example.</b> Priya joins as a trainee in Delhi. She needs to look at SW-DEL port status and nothing else. You give her <b>Network read-only</b> on <code>del</code>. She cannot change a VLAN, cannot see Mumbai, and cannot add other admins.</p></div>

<pre class="out">Admins and API  (organization: Bharat Retail Co, id 1001)
Name         Email                    Privilege                Scope
Atul         atul@bharat.example      Organization full        all networks
Meera        meera@bharat.example     Organization read-only   all networks
Priya        priya@bharat.example     Network read-only        <span class="hl">del</span>
Imran        imran@bharat.example     Network full             <span class="hl">blr</span></pre>

<h3>The licence concept in plain words</h3>
<p>Cloud-managed devices need an active <b>licence</b> for the organization: think of a subscription that lets the dashboard manage your devices. If it lapses, the dashboard raises an alert and, depending on the product, devices can stop being manageable. In this simulator the organization licence is simply valid or not valid (it also matters for site-to-site VPN in a later module). We do not teach purchase flows or tiers here; for real life, check the vendor documentation.</p>

<h3>The API access switch</h3>
<p>Besides the web page, the dashboard can be driven by programs through an <b>API</b> (a way for software to send requests, covered in the mk-api module). Access is controlled by an organization-level switch on the Admins and API page. If the switch is off, API calls are refused. Turn it on only if you need automation, and treat each API key like a password.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Adding an admin or changing a privilege changes <i>policy</i> in the dashboard only: no packet on the network changes. Turning API access off or on changes whether the dashboard accepts programmatic requests. Neither touches user traffic, but both change who can change your network, so they are high-value security settings.</p></div>

<div class="warn"><p><b>Common mistake.</b> Making everyone an organization full admin "to save time". When something breaks, nobody can tell who is responsible, and one compromised password owns the entire company.</p></div>
<div class="exam"><p><b>Exam trap.</b> A read-only admin can see configuration but never change it. If a question says a user "can see the page but Save is disabled", think privilege or template-controlled, not outage.</p></div>

<div class="scn"><h4>The trainee who rebooted the hub</h4><p>At a previous employer a trainee had full rights on the whole organization. While "just looking" at Mumbai, they clicked a setting and the head office lost its uplink for ten minutes. The post-incident review created a rule: trainees get read-only, branch engineers get full rights on their own network, and only two people hold organization full. The same click a month later was simply refused.</p><p><b>Lesson:</b> least privilege limits the blast radius of ordinary human error.</p></div>

<div class="iv"><p class="q">"How would you give a branch engineer access without risking other sites?"</p><p>Strong answer: create the admin with a network-scoped privilege (full on their network only, or read-only if they only need to look), keep organization full for a very small group, review the admin list regularly, and use the change log to see who changed what. Mention API keys too: enable API access only when needed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organization contains networks, networks contain devices.</li>
<li>A privilege is a level (full or read-only) plus a scope (organization or specific networks).</li>
<li>Least privilege limits damage from mistakes and stolen accounts.</li>
<li>A valid licence is needed for the organization to be managed; purchase details are out of scope.</li>
<li>The API access switch controls programmatic access; treat API keys like passwords.</li>
</ul></div>
`,hi:`
<h3>Organization: tree ka sabse upar ka hissa</h3>
<p>Cloud-managed estate mein sab kuch ek top-level container ke neeche hota hai jise <b>organization</b> kehte hain. Ise company ka account samjho. Humari company, Bharat Retail Co, organization 1001 hai. Uske neeche <b>networks</b> hain (har site ka ek: Mumbai HQ, Bengaluru Branch, Delhi Branch), aur har network ke neeche <b>devices</b>. Jo settings poori company par lagti hain (admin accounts, API access, licence, templates) woh organization ki hoti hain, kisi ek site ki nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Organization tree">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Organization 1001</text>
<line x1="320" y1="50" x2="320" y2="75" stroke="#64748b" stroke-width="2"/><line x1="100" y1="75" x2="540" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="100" y1="75" x2="100" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="75" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="540" y1="75" x2="540" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="100" y="120" text-anchor="middle" class="svg-ink" font-size="13">Network: mum</text>
<rect x="240" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Network: blr</text>
<rect x="460" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="540" y="120" text-anchor="middle" class="svg-ink" font-size="13">Network: del</text>
<rect x="20" y="160" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="100" y="182" text-anchor="middle" class="svg-ink" font-size="12">MX-MUM, SW-MUM</text><text x="100" y="198" text-anchor="middle" class="svg-ink" font-size="12">AP-MUM</text>
<rect x="240" y="160" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="12">MX-BLR, SW-BLR</text><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="12">AP-BLR</text>
<rect x="460" y="160" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="540" y="182" text-anchor="middle" class="svg-ink" font-size="12">MX-DEL, SW-DEL</text><text x="540" y="198" text-anchor="middle" class="svg-ink" font-size="12">AP-DEL</text>
<line x1="100" y1="135" x2="100" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="135" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="540" y1="135" x2="540" y2="160" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Organization, phir networks, phir devices. Admin accounts aur API access sabse upar hote hain.</p></div>

<h3>Admins aur roles</h3>
<p><b>Administrator</b> (admin) woh insaan hai jo dashboard mein login karta hai. Har admin ko ek <b>privilege</b> (role) milta hai: woh kya dekh sakta hai aur kahan badal sakta hai. Iska page <b>Admins and API</b> kehlata hai. Typical privileges yeh hain:</p>
<table class="cmp"><tr><th>Privilege</th><th>Insaan kya kar sakta hai</th><th>Bharat Retail Co mein example</th></tr>
<tr><td>Organization full</td><td>Sab kuch padhna aur badalna, admins sahit</td><td>Head of IT</td></tr>
<tr><td>Organization read-only</td><td>Sab dekhna, kuch badalna nahi</td><td>Auditor, NOC viewer</td></tr>
<tr><td>Network full (ek network)</td><td>Sirf apne scope ke networks badalna</td><td>Bengaluru site engineer</td></tr>
<tr><td>Network read-only</td><td>Sirf ek network dekhna</td><td>Bengaluru store manager</td></tr>
</table>
<p>Real product mein role ke exact naam alag hote hain; vendor documentation check karo. Idea stable hai: privilege ek <i>level</i> (full, read-only) aur ek <i>scope</i> (poora organization ya naam wale networks) ka combination hai.</p>

<h3>Least privilege: kaam ke layak sabse chhoti chaabi do</h3>
<p><b>Least privilege</b> ka matlab hai ki har insaan ko sirf utna access mile jitna uske kaam ke liye zaroori hai, usse zyada nahi. Kyun? Galti ya chori hua password sirf wahi bigaad sakta hai jise us account ne chhua tha. Agar Bengaluru engineer ke paas full rights sirf <code>blr</code> network par hain, to ek galat click Mumbai ko kabhi down nahi kar sakta. Audits mein bhi madad milti hai: change log dikhata hai kisne kya kiya, aur full admins ki chhoti list review karna aasaan hai.</p>
<div class="eg"><p><b>Worked example.</b> Priya Delhi mein trainee ke roop mein join karti hai. Use sirf SW-DEL ka port status dekhna hai. Aap use <code>del</code> par <b>Network read-only</b> dete ho. Woh VLAN nahi badal sakti, Mumbai nahi dekh sakti, aur dusre admins add nahi kar sakti.</p></div>

<pre class="out">Admins and API  (organization: Bharat Retail Co, id 1001)
Name         Email                    Privilege                Scope
Atul         atul@bharat.example      Organization full        all networks
Meera        meera@bharat.example     Organization read-only   all networks
Priya        priya@bharat.example     Network read-only        <span class="hl">del</span>
Imran        imran@bharat.example     Network full             <span class="hl">blr</span></pre>

<h3>Licence concept saaf shabdon mein</h3>
<p>Cloud-managed devices ko organization ke liye ek active <b>licence</b> chahiye: ise ek subscription samjho jo dashboard ko aapke devices manage karne deti hai. Agar yeh lapse ho jaye, to dashboard alert deta hai aur product ke hisaab se devices manage hona band ho sakte hain. Is simulator mein organization licence bas valid ya not valid hota hai (yeh baad ke module mein site-to-site VPN ke liye bhi matter karta hai). Yahan purchase flows ya tiers nahi sikhate; real life mein vendor documentation check karo.</p>

<h3>API access switch</h3>
<p>Web page ke alawa dashboard ko programs bhi <b>API</b> ke zariye chala sakte hain (software ke request bhejne ka tareeka, mk-api module mein aayega). Access ek organization-level switch se control hota hai, Admins and API page par. Switch off ho to API calls refuse ho jaati hain. Ise tabhi on karo jab automation chahiye, aur har API key ko password ki tarah treat karo.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Admin add karna ya privilege badalna sirf dashboard ki <i>policy</i> badalta hai: network par koi packet nahi badalta. API access on ya off karna badalta hai ki dashboard programmatic requests accept karega ya nahi. Koi bhi user traffic ko nahi chhuta, lekin dono yeh badalte hain ki aapka network kaun badal sakta hai, isliye yeh high-value security settings hain.</p></div>

<div class="warn"><p><b>Common galti.</b> "Time bachane ke liye" sabko organization full admin bana dena. Kuch toote to koi nahi bata sakta zimmedar kaun hai, aur ek compromised password poori company par kabza kar leta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read-only admin configuration dekh sakta hai lekin kabhi badal nahi sakta. Agar sawaal bole ki user "page dekh sakta hai lekin Save disabled hai", to privilege ya template-controlled socho, outage nahi.</p></div>

<div class="scn"><h4>Trainee jisne hub reboot kar diya</h4><p>Pichle employer mein ek trainee ke paas poore organization par full rights the. Mumbai ko "bas dekhte" hue unhone ek setting click kar di aur head office ka uplink dus minute ke liye chala gaya. Incident review ke baad rule bana: trainees ko read-only, branch engineers ko apne network par full rights, aur organization full sirf do logon ke paas. Mahine baad wahi click simply refuse ho gaya.</p><p><b>Seekh:</b> least privilege aam human error ka blast radius chhota rakhta hai.</p></div>

<div class="iv"><p class="q">"Branch engineer ko access kaise doge bina doosri sites ko risk mein daale?"</p><p>Strong answer: admin ko network-scoped privilege ke saath banao (sirf unke network par full, ya sirf dekhna ho to read-only), organization full bahut chhote group ke paas rakho, admin list ko regularly review karo, aur change log se dekho kisne kya badla. API keys bhi mention karo: API access sirf zaroorat par enable karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organization mein networks hote hain, networks mein devices.</li>
<li>Privilege = level (full ya read-only) plus scope (organization ya specific networks).</li>
<li>Least privilege galtiyon aur chori hue accounts ka nuksaan kam karta hai.</li>
<li>Organization manage hone ke liye valid licence chahiye; purchase details scope ke bahar hain.</li>
<li>API access switch programmatic access control karta hai; API keys ko password ki tarah rakho.</li>
</ul></div>
`}};export{e as default};