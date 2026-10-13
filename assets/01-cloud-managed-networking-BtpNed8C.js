var e={id:`cloud-managed`,h:{en:`Cloud-managed networking: control plane and data plane`,hi:`Cloud-managed networking: control plane aur data plane`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these six chapters you will understand how a cloud-managed network is organised (organization, networks, devices, tags, templates), who may change what (admin roles and least privilege), how one template can drive many branches, and a calm method to troubleshoot a site you cannot touch physically. <b>Prerequisites:</b> only basic IP addressing and Ethernet knowledge (what an IP address, a subnet, a VLAN and a switch are). Every other term is explained when it first appears. You will practise on the Bharat Retail Co dashboard simulator: Mumbai HQ, Bengaluru branch and Delhi branch.</p>

<h3>Start with an analogy: a chain of shops and one head office</h3>
<p>Imagine a retail chain with 200 shops. In the old way, each shop manager keeps a thick folder of rules and the head office phones them to change anything. In the new way, the head office has one control room with a screen showing every shop. The shop staff still sell, pack and bill locally. If the phone line to the head office is cut for an hour, the shops keep selling. Only the <i>management</i> is paused, not the <i>work</i>.</p>
<p>Cloud-managed networking is exactly this. The switches, access points and security appliances sit in your sites and forward traffic. Their settings are written and monitored from a web page called the <b>dashboard</b>, which runs in the vendor's cloud.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Control plane in the cloud, data plane at the site">
<rect x="170" y="10" width="300" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Dashboard (cloud) = control plane</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">configuration, monitoring, alerts, change log</text>
<line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="332" y="100" class="svg-muted" font-size="12">management tunnel (outbound)</text>
<rect x="30" y="120" width="580" height="120" rx="10" fill="#e2e8f0"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Site: Mumbai HQ = data plane</text>
<rect x="60" y="160" width="110" height="50" rx="8" fill="#bae6fd"/><text x="115" y="190" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM</text>
<rect x="265" y="160" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">SW-MUM</text>
<rect x="470" y="160" width="110" height="50" rx="8" fill="#fde68a"/><text x="525" y="190" text-anchor="middle" class="svg-ink" font-size="13">AP-MUM</text>
<line x1="170" y1="185" x2="265" y2="185" stroke="#64748b" stroke-width="2"/><line x1="375" y1="185" x2="470" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The cloud decides the rules (control plane). The devices at the site forward the packets (data plane).</p></div>

<h3>Control plane and data plane in plain words</h3>
<dl class="terms">
<dt>Data plane</dt><dd>The part that moves user traffic: a packet arrives on a port and leaves on another. It must be fast and local.</dd>
<dt>Control plane</dt><dd>The part that decides the rules: which VLANs exist, which firewall rules apply, which SSIDs are broadcast. In classic networks every box has its own control plane that you reach by CLI. In cloud-managed networking the rules are authored centrally in the dashboard and pushed to the devices.</dd>
<dt>Management plane</dt><dd>The channel between the dashboard and each device, used to send configuration and to bring back status. Devices open it outbound towards the cloud, so you do not need to open inbound holes at the branch.</dd>
</dl>

<h3>Why put the dashboard in the cloud?</h3>
<ul>
<li><b>One place to see everything.</b> Mumbai, Bengaluru and Delhi appear in one list. You do not need a VPN into each site to read a device.</li>
<li><b>Zero-touch rollout.</b> A new device is claimed by its serial number and then fetches its configuration when it first reaches the internet (chapter 3).</li>
<li><b>Consistency.</b> One template can drive many sites (chapter 4).</li>
<li><b>Auditability.</b> Every change is recorded with who and when (chapter 5).</li>
</ul>

<h3>What keeps working if the cloud is unreachable?</h3>
<p>At a high level, devices keep forwarding traffic using the last configuration they received, because the data plane is local. What you lose is the ability to <i>change</i> or <i>see</i> things until the connection returns. Exact timers and edge cases differ by feature, so for real equipment check the vendor documentation. In this simulator you meet a smaller version of the same idea: a device that cannot reach the dashboard shows as <b>offline</b> in the dashboard, even though users behind it may be working fine.</p>

<div class="eg"><p><b>Worked example.</b> SW-BLR is shown offline on the dashboard at 11:05. The Bengaluru staff phone says billing is fine. Both facts are consistent: the data plane (users) is fine, the management path (switch to dashboard) is broken. The first question is therefore not "is the shop down?" but "which of the two planes is broken?".</p></div>

<pre class="out">Network: Bengaluru Branch (blr)
Device     Role        Status    Last seen
MX-BLR     appliance   <span class="hl">online</span>    just now
SW-BLR     switch      <span class="hl">offline</span>   11 min ago
AP-BLR     wireless    offline   11 min ago</pre>

<div class="warn"><p><b>Common mistake.</b> Treating "offline in the dashboard" as "users are down". It only means the dashboard cannot hear the device. Always ask what users see before escalating, and always ask what changed recently.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Cloud-managed" does not mean user traffic goes through the cloud. User traffic stays in the site network (or the VPN between sites). Only management traffic goes to the cloud.</p></div>

<div class="scn"><h4>The 2 a.m. SMS</h4><p>The Delhi branch manager wakes you: "Dashboard says our devices are offline." You open the dashboard and see MX-DEL online but SW-DEL and AP-DEL offline. A colleague in Delhi confirms billing works. You deduce the data plane is healthy and only the management path of the switch is broken, so you check the recent change log and find that someone edited the uplink trunk an hour earlier. You roll the change back and the devices return.</p><p><b>Lesson:</b> separate "are users hurt" from "can I see the device", then look at what changed.</p></div>

<div class="iv"><p class="q">"What is the difference between control plane and data plane in a cloud-managed network?"</p><p>Strong answer: the data plane forwards user traffic locally on the devices; the control plane (configuration and monitoring) lives in the cloud dashboard and reaches devices over an outbound management connection. If the cloud is unreachable, forwarding generally continues with the last config, but you cannot change or monitor until it returns. Mention that you would verify exact behaviour in the vendor documentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud-managed means configuration and monitoring are in a cloud dashboard; traffic is forwarded locally.</li>
<li>Control plane = rules, data plane = packet forwarding, management plane = the channel between them.</li>
<li>Devices connect outbound to the cloud, so branches need no inbound holes for management.</li>
<li>Offline in the dashboard is not the same as users down.</li>
<li>Our tagline: click-ops, but you understand what each click does.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chhe chapters ke end tak aap samjhoge ki cloud-managed network kaise organise hota hai (organization, networks, devices, tags, templates), kaun kya change kar sakta hai (admin roles aur least privilege), ek template kaise bahut saari branches ko drive karta hai, aur ek aisi site ko troubleshoot karne ka shaant method jise aap physically chhu nahi sakte. <b>Prerequisites:</b> sirf basic IP addressing aur Ethernet ki knowledge (IP address, subnet, VLAN aur switch kya hote hain). Baaki har term pehli baar aane par explain hota hai. Aap Bharat Retail Co dashboard simulator par practise karoge: Mumbai HQ, Bengaluru branch aur Delhi branch.</p>

<h3>Ek analogy se shuru karo: shops ki chain aur ek head office</h3>
<p>Socho ek retail chain ki 200 shops hain. Purane tareeke mein har shop manager ke paas rules ka mota folder hota hai aur kuch bhi badalna ho to head office phone karta hai. Naye tareeke mein head office ke paas ek control room hai jiski screen par har shop dikhti hai. Shop staff phir bhi local mein bechta, pack karta aur billing karta hai. Agar head office ki phone line ek ghante ke liye kat jaye, to shops bechti rehti hain. Sirf <i>management</i> ruka hai, <i>kaam</i> nahi.</p>
<p>Cloud-managed networking bilkul yahi hai. Switches, access points aur security appliances aapki sites par baithe traffic forward karte hain. Unki settings ek web page se likhi aur monitor ki jaati hain jise <b>dashboard</b> kehte hain, aur woh vendor ke cloud mein chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Control plane cloud mein, data plane site par">
<rect x="170" y="10" width="300" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Dashboard (cloud) = control plane</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">configuration, monitoring, alerts, change log</text>
<line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="332" y="100" class="svg-muted" font-size="12">management tunnel (outbound)</text>
<rect x="30" y="120" width="580" height="120" rx="10" fill="#e2e8f0"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Site: Mumbai HQ = data plane</text>
<rect x="60" y="160" width="110" height="50" rx="8" fill="#bae6fd"/><text x="115" y="190" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM</text>
<rect x="265" y="160" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">SW-MUM</text>
<rect x="470" y="160" width="110" height="50" rx="8" fill="#fde68a"/><text x="525" y="190" text-anchor="middle" class="svg-ink" font-size="13">AP-MUM</text>
<line x1="170" y1="185" x2="265" y2="185" stroke="#64748b" stroke-width="2"/><line x1="375" y1="185" x2="470" y2="185" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Cloud rules decide karta hai (control plane). Site ke devices packets forward karte hain (data plane).</p></div>

<h3>Control plane aur data plane saaf shabdon mein</h3>
<dl class="terms">
<dt>Data plane</dt><dd>Woh hissa jo user traffic ko move karta hai: packet ek port par aata hai aur dusre port se nikalta hai. Yeh fast aur local hona chahiye.</dd>
<dt>Control plane</dt><dd>Woh hissa jo rules decide karta hai: kaunse VLANs hain, kaunse firewall rules lagenge, kaunse SSIDs broadcast honge. Classic networks mein har box ka apna control plane hota hai jise aap CLI se reach karte ho. Cloud-managed networking mein rules dashboard mein central tarike se likhe jaate hain aur devices ko push hote hain.</dd>
<dt>Management plane</dt><dd>Dashboard aur har device ke beech ka channel, jisse configuration bheja jaata hai aur status wapas aata hai. Devices ise cloud ki taraf outbound kholte hain, isliye branch par management ke liye inbound holes kholne ki zaroorat nahi.</dd>
</dl>

<h3>Dashboard cloud mein kyun rakhte hain?</h3>
<ul>
<li><b>Sab kuch ek jagah.</b> Mumbai, Bengaluru aur Delhi ek hi list mein dikhte hain. Device padhne ke liye har site mein VPN lagane ki zaroorat nahi.</li>
<li><b>Zero-touch rollout.</b> Naya device serial number se claim hota hai aur pehli baar internet milte hi apni configuration utha leta hai (chapter 3).</li>
<li><b>Consistency.</b> Ek template bahut saari sites ko drive kar sakta hai (chapter 4).</li>
<li><b>Auditability.</b> Har change kisne aur kab kiya, record hota hai (chapter 5).</li>
</ul>

<h3>Cloud unreachable ho jaye to kya chalta rehta hai?</h3>
<p>High level par, devices last mili configuration se traffic forward karte rehte hain, kyunki data plane local hai. Jo aap khote ho woh hai cheezein <i>badalna</i> ya <i>dekhna</i>, jab tak connection wapas na aaye. Exact timers aur edge cases feature ke hisaab se alag hote hain, isliye real equipment par vendor documentation check karo. Is simulator mein aap isi idea ka chhota version dekhte ho: jo device dashboard tak nahi pahunch paata woh dashboard mein <b>offline</b> dikhta hai, chahe uske peeche ke users theek chal rahe hon.</p>

<div class="eg"><p><b>Worked example.</b> 11:05 par dashboard mein SW-BLR offline dikh raha hai. Bengaluru staff phone par bolta hai billing theek hai. Dono baatein consistent hain: data plane (users) theek hai, management path (switch se dashboard) toota hua hai. Isliye pehla sawaal "shop down hai?" nahi, balki "do planes mein se kaunsa toota hai?" hona chahiye.</p></div>

<pre class="out">Network: Bengaluru Branch (blr)
Device     Role        Status    Last seen
MX-BLR     appliance   <span class="hl">online</span>    just now
SW-BLR     switch      <span class="hl">offline</span>   11 min ago
AP-BLR     wireless    offline   11 min ago</pre>

<div class="warn"><p><b>Common galti.</b> "Dashboard mein offline" ko "users down" maan lena. Iska matlab sirf itna hai ki dashboard device ko sun nahi pa raha. Escalate karne se pehle hamesha poochho users ko kya dikh raha hai, aur recently kya change hua.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Cloud-managed" ka matlab yeh nahi ki user traffic cloud se guzarta hai. User traffic site network (ya sites ke beech VPN) mein rehta hai. Sirf management traffic cloud jaata hai.</p></div>

<div class="scn"><h4>Raat 2 baje ka SMS</h4><p>Delhi branch manager aapko jagata hai: "Dashboard bol raha hai humare devices offline hain." Aap dashboard kholte ho to MX-DEL online hai lekin SW-DEL aur AP-DEL offline. Delhi mein ek colleague confirm karta hai ki billing chal rahi hai. Aap samajhte ho ki data plane theek hai aur sirf switch ka management path toota hai, to aap recent change log dekhte ho aur ek ghante pehle kisi ne uplink trunk edit kiya tha. Aap woh change wapas karte ho aur devices laut aate hain.</p><p><b>Seekh:</b> pehle alag karo "users ko takleef hai?" aur "mujhe device dikh raha hai?", phir dekho kya change hua.</p></div>

<div class="iv"><p class="q">"Cloud-managed network mein control plane aur data plane ka kya farak hai?"</p><p>Strong answer: data plane devices par local tarike se user traffic forward karta hai; control plane (configuration aur monitoring) cloud dashboard mein hota hai aur devices tak outbound management connection se pahunchta hai. Cloud unreachable ho to forwarding aam taur par last config se chalti rehti hai, lekin wapas aane tak aap change ya monitor nahi kar sakte. Bolo ki exact behaviour aap vendor documentation mein verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud-managed ka matlab configuration aur monitoring cloud dashboard mein hai; traffic local forward hota hai.</li>
<li>Control plane = rules, data plane = packet forwarding, management plane = dono ke beech ka channel.</li>
<li>Devices cloud se outbound connect karte hain, isliye branches ko management ke liye inbound holes nahi chahiye.</li>
<li>Dashboard mein offline hone ka matlab users down hona nahi hai.</li>
<li>Humari tagline: click-ops, but you understand what each click does.</li>
</ul></div>
`}};export{e as default};