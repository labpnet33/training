var e={id:`firewall`,h:{en:`Firewall rules and order: first match wins`,hi:`Firewall rules aur order: pehla match jeetta hai`},body:{en:`
<h3>What a firewall rule is</h3>
<p>A <b>firewall</b> compares each new connection with a list of <b>rules</b> and decides to allow or deny it. A <b>Layer 3 rule</b> (L3 rule) looks at the network layer: <b>protocol</b> (any, TCP, UDP, ICMP), <b>source</b>, <b>destination</b> and, for TCP and UDP, the destination port. A rule also has a <b>policy</b>: Allow or Deny. You write rules on the <b>Firewall</b> page, one row per rule, in a table.</p>

<h3>The one law: top to bottom, first match wins</h3>
<p>The appliance reads the list from the top. For each connection it stops at the <b>first</b> rule that matches and applies that rule's policy. It never looks at the rules below. Therefore the <b>order is the policy</b>. If a broad "Allow any" sits above a specific "Deny guests to servers", the deny can never be reached.</p>
<p>At the bottom there is an <b>implicit final rule</b>: allow any. It exists even if you do not see it as a normal row (in this simulator it is editable). So anything not denied above is allowed. This default makes it easy to get started but means a firewall with no deny rules blocks nothing.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Rule list evaluated top to bottom">
<rect x="20" y="10" width="360" height="40" rx="6" fill="#bbf7d0"/><text x="30" y="35" class="svg-ink" font-size="13">1  Allow  Staff (10)  to  Servers (20)</text>
<rect x="20" y="56" width="360" height="40" rx="6" fill="#fecaca"/><text x="30" y="81" class="svg-ink" font-size="13">2  Deny   Guest (30)  to  Servers and Staff</text>
<rect x="20" y="102" width="360" height="40" rx="6" fill="#fecaca"/><text x="30" y="127" class="svg-ink" font-size="13">3  Deny   any  to  Management (99)</text>
<rect x="20" y="148" width="360" height="40" rx="6" fill="#e2e8f0"/><text x="30" y="173" class="svg-ink" font-size="13">Default  Allow any to any (implicit)</text>
<line x1="400" y1="30" x2="400" y2="170" stroke="#64748b" stroke-width="2"/><polygon points="400,180 394,168 406,168" fill="#64748b"/>
<text x="420" y="60" class="svg-ink" font-size="13">Checked in this order.</text><text x="420" y="82" class="svg-ink" font-size="13">First match = decision.</text><text x="420" y="104" class="svg-ink" font-size="13">Nothing below is read.</text>
<rect x="20" y="205" width="600" height="40" rx="6" fill="#fde68a"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="13">Swap rules 1 and 2 and the answer may change: the order is the policy</text>
</svg><p class="cap">A packet walks the list from the top and stops at the first rule that matches.</p></div>

<h3>Hit counts: proof of what the rules do</h3>
<p>Each rule keeps a <b>hit counter</b> of how many connections matched it. It is the best debugging tool on the page. A rule with zero hits that you expected to fire is shadowed by a rule above it, or does not match the traffic (wrong subnet, wrong protocol). A rule with very large hits may be broader than you think.</p>
<pre class="out">Firewall  L3 rules  (network: Bengaluru Branch)
#  Policy  Protocol  Source        Destination     Hits
1  Allow   any       10.2.10.0/24  10.2.20.0/24    312
2  Deny    any       10.2.30.0/24  10.2.20.0/24    <span class="hl">47</span>
3  Deny    any       any           10.2.99.0/24    9
D  Allow   any       any           any             8,240  (default)</pre>
<p>Here rule 2 has 47 hits: guests tried to reach the server VLAN 47 times and were blocked.</p>

<h3>Inter-VLAN and guest isolation</h3>
<p>Because the MX routes between VLANs, the firewall is where you decide which VLANs may talk. Our policy: staff may reach servers; guests may reach the internet only (not servers, not staff, not management); nobody except management may reach VLAN 99. This is called <b>guest isolation</b> at the firewall. (The wireless module adds <b>client isolation</b> on the SSID, which stops guests talking to each other; it is a different control.)</p>

<div class="eg"><p><b>Worked example.</b> Guest phone 10.2.30.120 opens intranet.example (10.1.20.10, the server at Mumbai, reached over the site-to-site VPN). Walk the list: rule 1 (source Staff) does not match; rule 2 (source Guest, destination Servers) matches, Deny. The phone is blocked and rule 2's hit count rises. If the engineer had put "Allow any to any" as rule 1, the guest would have been allowed and rule 2 would show zero hits.</p></div>

<h3>The L7 idea</h3>
<p>Layer 3 rules know addresses and ports. <b>Layer 7</b> (application layer) rules look at what kind of application or content the traffic is, for example blocking a category of web services regardless of its address. The next chapters cover content filtering, the L7-style control in this module. Which L7 rule types exist in a real product, and their limits, comes from the vendor documentation.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Adding or moving a rule changes the policy decision for matching connections from the moment you save. Moving a rule up gives it priority over everything below. Editing the default (last) rule changes what happens to all unmatched traffic. No address or VLAN changes: this is policy only. Existing allowed connections may continue until they end, so test with new connections.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A broad Allow above a specific Deny; writing the source and destination the wrong way round; using the wrong subnet in a rule; forgetting that the default is allow; testing with an old connection instead of a new one.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Rule 5 denies guests but guests still reach servers." Look for an earlier rule that allows them: first match wins. Also check the hit counters.</p></div>

<div class="scn"><h4>The guest who could see the server</h4><p>During an audit, a tester on the guest SSID in Delhi reached the file server in VLAN 20. The rule table had a Deny for guests, but it was row 4, below a rule 1 that said "Allow any to 10.3.20.0/24" added for a vendor visit last month. Rule 4 showed zero hits. The engineer removed the old rule 1; rule 4 hits began to climb and the guest was blocked.</p><p><b>Lesson:</b> zero hits on a rule that should fire means it is being shadowed. Review order, not just content.</p></div>

<div class="iv"><p class="q">"How does an appliance evaluate firewall rules, and how do you debug a rule that does not work?"</p><p>Strong answer: top to bottom, first match wins, with an implicit allow at the end. To debug, I check the hit counters, look for a broader rule above, verify source, destination and protocol, and test with a new connection. I would move the specific deny above the broad allow and confirm the counters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3 rules match protocol, source, destination and port, then Allow or Deny.</li>
<li>Rules are read top to bottom; the first match wins and the order is the policy.</li>
<li>The implicit final rule allows everything unless you change it.</li>
<li>Hit counters show which rule actually handled traffic; zero hits means shadowed or non-matching.</li>
<li>Guest isolation is an inter-VLAN firewall policy; L7 ideas continue in content filtering.</li>
</ul></div>
`,hi:`
<h3>Firewall rule kya hai</h3>
<p><b>Firewall</b> har nayi connection ko <b>rules</b> ki list se compare karta hai aur allow ya deny decide karta hai. <b>Layer 3 rule</b> (L3 rule) network layer dekhta hai: <b>protocol</b> (any, TCP, UDP, ICMP), <b>source</b>, <b>destination</b> aur TCP aur UDP ke liye destination port. Rule ki ek <b>policy</b> bhi hoti hai: Allow ya Deny. Aap rules <b>Firewall</b> page par table mein likhte ho, har rule ki ek row.</p>

<h3>Ek hi kanoon: upar se neeche, pehla match jeetta hai</h3>
<p>Appliance list ko upar se padhta hai. Har connection ke liye woh <b>pehle</b> matching rule par ruk jaata hai aur us rule ki policy lagata hai. Neeche ke rules woh kabhi nahi dekhta. Isliye <b>order hi policy hai</b>. Agar specific "Deny guests to servers" ke upar broad "Allow any" baitha hai, to deny kabhi reach hi nahi hota.</p>
<p>Sabse neeche ek <b>implicit final rule</b> hota hai: allow any. Yeh tab bhi hota hai jab aap use normal row ke roop mein na dekho (is simulator mein yeh editable hai). To jo kuch upar deny nahi hua woh allow hai. Is default se shuru karna aasaan hai lekin matlab hai ki bina deny rules wala firewall kuch block nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Rule list upar se neeche evaluate hoti hai">
<rect x="20" y="10" width="360" height="40" rx="6" fill="#bbf7d0"/><text x="30" y="35" class="svg-ink" font-size="13">1  Allow  Staff (10)  to  Servers (20)</text>
<rect x="20" y="56" width="360" height="40" rx="6" fill="#fecaca"/><text x="30" y="81" class="svg-ink" font-size="13">2  Deny   Guest (30)  to  Servers aur Staff</text>
<rect x="20" y="102" width="360" height="40" rx="6" fill="#fecaca"/><text x="30" y="127" class="svg-ink" font-size="13">3  Deny   any  to  Management (99)</text>
<rect x="20" y="148" width="360" height="40" rx="6" fill="#e2e8f0"/><text x="30" y="173" class="svg-ink" font-size="13">Default  Allow any to any (implicit)</text>
<line x1="400" y1="30" x2="400" y2="170" stroke="#64748b" stroke-width="2"/><polygon points="400,180 394,168 406,168" fill="#64748b"/>
<text x="420" y="60" class="svg-ink" font-size="13">Is order mein check hota hai.</text><text x="420" y="82" class="svg-ink" font-size="13">Pehla match = decision.</text><text x="420" y="104" class="svg-ink" font-size="13">Neeche kuch nahi padha jaata.</text>
<rect x="20" y="205" width="600" height="40" rx="6" fill="#fde68a"/><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="13">Rules 1 aur 2 swap karo to jawab badal sakta hai: order hi policy hai</text>
</svg><p class="cap">Packet list ko upar se chalta hai aur pehle matching rule par ruk jaata hai.</p></div>

<h3>Hit counts: rules kya karte hain uska saboot</h3>
<p>Har rule ek <b>hit counter</b> rakhta hai ki kitni connections us se match hui. Yeh page ka sabse achha debugging tool hai. Jis rule se aap fire hone ki ummeed karte ho aur uske zero hits hain, woh upar ke kisi rule se shadow ho raha hai, ya traffic se match nahi karta (galat subnet, galat protocol). Bahut bade hits wala rule aapke socha hua se broad ho sakta hai.</p>
<pre class="out">Firewall  L3 rules  (network: Bengaluru Branch)
#  Policy  Protocol  Source        Destination     Hits
1  Allow   any       10.2.10.0/24  10.2.20.0/24    312
2  Deny    any       10.2.30.0/24  10.2.20.0/24    <span class="hl">47</span>
3  Deny    any       any           10.2.99.0/24    9
D  Allow   any       any           any             8,240  (default)</pre>
<p>Yahan rule 2 ke 47 hits hain: guests ne server VLAN tak 47 baar pahunchne ki koshish ki aur block hue.</p>

<h3>Inter-VLAN aur guest isolation</h3>
<p>Kyunki MX VLANs ke beech route karta hai, firewall woh jagah hai jahan aap decide karte ho ki kaunsi VLANs baat kar sakti hain. Humari policy: staff servers tak pahunch sakta hai; guests sirf internet tak (servers, staff, management tak nahi); VLAN 99 tak management ke alawa koi nahi. Isse firewall par <b>guest isolation</b> kehte hain. (Wireless module SSID par <b>client isolation</b> add karta hai, jo guests ko ek dusre se baat karne se rokta hai; yeh alag control hai.)</p>

<div class="eg"><p><b>Worked example.</b> Guest phone 10.2.30.120 intranet.example (10.1.20.10, Mumbai ka server, site-to-site VPN se) kholta hai. List chalao: rule 1 (source Staff) match nahi karta; rule 2 (source Guest, destination Servers) match karta hai, Deny. Phone block ho jaata hai aur rule 2 ka hit count badhta hai. Agar engineer ne "Allow any to any" ko rule 1 rakha hota, to guest allow ho jaata aur rule 2 ke hits zero rehte.</p></div>

<h3>L7 ka idea</h3>
<p>Layer 3 rules addresses aur ports jaante hain. <b>Layer 7</b> (application layer) rules dekhte hain ki traffic kis tarah ki application ya content hai, jaise web services ki ek category ko uske address ki parwah kiye bina block karna. Agle chapters content filtering cover karte hain, jo is module ka L7-style control hai. Real product mein kaunse L7 rule types hote hain aur unki limits, vendor documentation se aati hain.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Rule add karne ya move karne se matching connections ka policy decision save karne ke baad badal jaata hai. Rule ko upar le jaane se use neeche ke sab par priority milti hai. Default (last) rule edit karne se saare unmatched traffic ka haal badalta hai. Koi address ya VLAN nahi badalta: yeh sirf policy hai. Pehle se allowed connections khatam hone tak chal sakti hain, isliye nayi connections se test karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Specific Deny ke upar broad Allow; source aur destination ulte likhna; rule mein galat subnet; yeh bhool jaana ki default allow hai; purani connection se test karna, nayi se nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Rule 5 guests ko deny karta hai lekin guests phir bhi servers tak pahunch rahe hain." Pehle ka koi rule dhoondho jo unhe allow karta hai: pehla match jeetta hai. Hit counters bhi check karo.</p></div>

<div class="scn"><h4>Guest jo server dekh paya</h4><p>Audit ke dauraan Delhi mein guest SSID par ek tester file server (VLAN 20) tak pahunch gaya. Rule table mein guests ke liye Deny tha, lekin woh row 4 mein tha, aise rule 1 ke neeche jo bolta tha "Allow any to 10.3.20.0/24", jo pichhle mahine ek vendor visit ke liye daala gaya tha. Rule 4 ke hits zero the. Engineer ne purana rule 1 hata diya; rule 4 ke hits badhne lage aur guest block ho gaya.</p><p><b>Seekh:</b> jis rule ko fire hona chahiye usme zero hits ka matlab hai woh shadow ho raha hai. Sirf content nahi, order review karo.</p></div>

<div class="iv"><p class="q">"Appliance firewall rules kaise evaluate karta hai, aur jo rule kaam nahi kar raha use kaise debug karoge?"</p><p>Strong answer: upar se neeche, pehla match jeetta hai, aur end mein implicit allow hota hai. Debug ke liye main hit counters check karta hoon, upar ka broader rule dhoondhta hoon, source, destination aur protocol verify karta hoon, aur nayi connection se test karta hoon. Main specific deny ko broad allow ke upar move karunga aur counters confirm karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3 rules protocol, source, destination aur port match karte hain, phir Allow ya Deny.</li>
<li>Rules upar se neeche padhe jaate hain; pehla match jeetta hai aur order hi policy hai.</li>
<li>Implicit final rule sab kuch allow karta hai jab tak aap use na badlo.</li>
<li>Hit counters dikhate hain ki asal mein kis rule ne traffic handle kiya; zero hits ka matlab shadowed ya non-matching.</li>
<li>Guest isolation inter-VLAN firewall policy hai; L7 ideas content filtering mein aage badhte hain.</li>
</ul></div>
`}};export{e as default};