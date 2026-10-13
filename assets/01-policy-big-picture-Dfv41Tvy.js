var e={id:`policy-big-picture`,h:{en:`Security policy on Prisma Access: the big picture`,hi:`Prisma Access par security policy: big picture`},body:{en:`
<p>Think about a busy international airport. Passengers arrive by metro, by taxi and by bus, through different entrances. But everyone, without exception, goes through the same security hall before reaching the gates. In the hall, officers check who you are, what you carry and where you are going, and they write down what they saw. <b>Prisma Access security policy</b> is that security hall. Mobile users, branch offices and the head office are the different entrances. The hall is one set of rules that every flow must pass.</p>

<h3>What you will learn</h3>
<ul>
<li>How traffic from mobile users, remote networks and service connections reaches the policy engine.</li>
<li>Zones (Trust, Untrust, Clientless VPN) and why zone mapping decides which rules apply.</li>
<li>Where rules live: Panorama device groups and templates, or Strata Cloud Manager (SCM) folders and snippets.</li>
<li>How to write App-ID rules, attach security profiles and URL filtering, and use users and HIP in rules.</li>
<li>How to keep rule order clean, forward logs, and troubleshoot a policy match with traffic logs.</li>
</ul>
<p><b>Prerequisites:</b> the earlier Prisma Access modules (start, mobile users, remote networks, service connections). You should know that GlobalProtect users, branches and HQ are already connected. This module is about what happens to the traffic once it arrives.</p>

<h3>The path of one flow</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Policy path">
<rect x="15" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="13">Mobile users</text>
<rect x="15" y="88" width="120" height="44" rx="8" fill="#bae6fd"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">Remote network</text>
<rect x="15" y="156" width="120" height="44" rx="8" fill="#bae6fd"/><text x="75" y="183" text-anchor="middle" class="svg-ink" font-size="13">Service connection</text>
<rect x="200" y="70" width="120" height="80" rx="8" fill="#fde68a"/><text x="260" y="104" text-anchor="middle" class="svg-ink" font-size="13">Zone mapping</text><text x="260" y="124" text-anchor="middle" class="svg-muted" font-size="12">trust or untrust</text>
<rect x="380" y="70" width="110" height="80" rx="8" fill="#ddd6fe"/><text x="435" y="104" text-anchor="middle" class="svg-ink" font-size="13">Rulebase</text><text x="435" y="124" text-anchor="middle" class="svg-muted" font-size="12">top to bottom</text>
<rect x="540" y="20" width="85" height="44" rx="8" fill="#bbf7d0"/><text x="582" y="47" text-anchor="middle" class="svg-ink" font-size="13">Profiles</text>
<rect x="540" y="88" width="85" height="44" rx="8" fill="#bbf7d0"/><text x="582" y="115" text-anchor="middle" class="svg-ink" font-size="13">Action</text>
<rect x="540" y="156" width="85" height="44" rx="8" fill="#fed7aa"/><text x="582" y="183" text-anchor="middle" class="svg-ink" font-size="13">Log</text>
<line x1="135" y1="42" x2="200" y2="100" stroke="#64748b" stroke-width="2"/><line x1="135" y1="110" x2="200" y2="110" stroke="#64748b" stroke-width="2"/><line x1="135" y1="178" x2="200" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="110" x2="380" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="100" x2="540" y2="42" stroke="#64748b" stroke-width="2"/><line x1="490" y1="110" x2="540" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="120" x2="540" y2="178" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three entrances, one zone mapping step, one rulebase. The result is an action, profile inspection and a log entry.</p></div>

<h3>Key terms</h3>
<dl class="terms">
<dt>Zone</dt><dd>A label for a group of network entry or exit points. Rules match on source zone and destination zone. Prisma Access creates three zones: Trust, Untrust and Clientless VPN.</dd>
<dt>Security rule</dt><dd>One line of policy: match conditions (zones, addresses, users, applications) plus an action (allow or deny) and optional profiles and logging.</dd>
<dt>App-ID</dt><dd>Palo Alto Networks application identification. Rules name the application (for example ssl or web-browsing), not just a port.</dd>
<dt>Security profile</dt><dd>Deep inspection attached to an allow rule: threats, malware, URL categories and more.</dd>
<dt>Panorama and SCM</dt><dd>The two management tools. Panorama (with the Cloud Services plugin) uses device groups and templates. SCM uses folders and snippets. Rules are the same idea in both.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> The home laptop (203.0.113.50) connects with GlobalProtect and receives an address from the mobile pool 10.200.0.0/23. The user opens the internal app at 10.10.0.50 in the HQ data centre. The flow enters Prisma Access, the destination is placed in a zone through zone mapping, the rulebase is read from the top, the first matching rule decides, and a traffic log records the rule name. When the same user opens a public site, the destination zone is different, so a different rule matches. Same user, same entrance, two different outcomes. That is the whole module in one story.</p></div>

<h3>Why policy is a separate topic</h3>
<p>Connectivity modules answer "can the packet get there?". Policy answers "should it?". A tunnel can be perfectly healthy and users can still be blocked because no rule allows them, or worse, allowed too much because one wide rule sits at the top. In a cloud security service the policy is the product the customer is paying for, so mistakes here are both a security risk and a support ticket.</p>

<div class="note"><p><b>Teaching model.</b> The real Prisma Access console is a cloud service. In this course we use a simplified model of tenant, zones, rules and logs so you can practise the logic. Where the real product has extra screens, the chapters say so.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming a healthy tunnel means traffic is allowed; writing rules before deciding the zone mapping; treating Panorama and SCM as different security engines (the engine is the same idea, only the container and the menus differ).</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy is enforced between zones. If a destination is left in the default zone, rules written for the data-centre zone will never match. Always ask first: which zone is this traffic in?</p></div>

<div class="scn"><h4>The tunnel was green, the app was dead</h4><p>After a new data-centre subnet was onboarded, the service connection showed healthy, yet mobile users could not open the HQ app at 10.10.0.50. The engineer did not touch the tunnel. The traffic log showed the flow hitting the final deny rule because the data-centre destination was still in the default untrust zone. Moving the zone to trusted and pushing fixed it.</p><p><b>Lesson:</b> healthy transport does not mean permitted traffic. Read the log before touching connectivity.</p></div>

<div class="iv"><p class="q">"Where does security policy fit in a Prisma Access deployment?"</p><p>After connectivity: all three attachment types (mobile users, remote networks, service connections) feed one policy engine. Mention zone mapping first, then rules read top to bottom, then profiles and logs. Add that policy is managed through Panorama device groups or SCM folders.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every flow from every entrance passes the same policy engine.</li>
<li>Zones come first: rules match on source and destination zone.</li>
<li>A rule combines match conditions, an action, profiles and logging.</li>
<li>Panorama and SCM differ in containers and menus, not in the policy idea.</li>
<li>Healthy tunnels do not prove permitted traffic; the traffic log does.</li>
</ul></div>
`,hi:`
<p>Ek busy international airport socho. Passengers metro, taxi aur bus se alag alag entrances par aate hain. Lekin sab ko, bina exception, gates tak jaane se pehle ek hi security hall se guzarna padta hai. Hall mein officers check karte hain ki aap kaun ho, kya le jaa rahe ho aur kahan jaa rahe ho, aur jo dekha use likh lete hain. <b>Prisma Access security policy</b> wahi security hall hai. Mobile users, branch offices aur head office alag alag entrances hain. Hall ek hi rules ka set hai jise har flow ko pass karna hai.</p>

<h3>Is chapter mein aap seekhoge</h3>
<ul>
<li>Mobile users, remote networks aur service connections ka traffic policy engine tak kaise pahunchta hai.</li>
<li>Zones (Trust, Untrust, Clientless VPN) aur zone mapping kaise decide karti hai ki kaunse rules lagenge.</li>
<li>Rules kahan rehte hain: Panorama device groups aur templates, ya Strata Cloud Manager (SCM) folders aur snippets.</li>
<li>App-ID rules kaise likhte hain, security profiles aur URL filtering kaise attach karte hain, aur rules mein users aur HIP kaise use karte hain.</li>
<li>Rule order clean kaise rakhein, logs kaise forward karein, aur traffic logs se policy match troubleshoot kaise karein.</li>
</ul>
<p><b>Prerequisites:</b> pehle ke Prisma Access modules (start, mobile users, remote networks, service connections). Aapko pata hona chahiye ki GlobalProtect users, branches aur HQ pehle se connected hain. Ye module batata hai ki traffic pahunchne ke baad uske saath kya hota hai.</p>

<h3>Ek flow ka path</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Policy path">
<rect x="15" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="13">Mobile users</text>
<rect x="15" y="88" width="120" height="44" rx="8" fill="#bae6fd"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">Remote network</text>
<rect x="15" y="156" width="120" height="44" rx="8" fill="#bae6fd"/><text x="75" y="183" text-anchor="middle" class="svg-ink" font-size="13">Service connection</text>
<rect x="200" y="70" width="120" height="80" rx="8" fill="#fde68a"/><text x="260" y="104" text-anchor="middle" class="svg-ink" font-size="13">Zone mapping</text><text x="260" y="124" text-anchor="middle" class="svg-muted" font-size="12">trust ya untrust</text>
<rect x="380" y="70" width="110" height="80" rx="8" fill="#ddd6fe"/><text x="435" y="104" text-anchor="middle" class="svg-ink" font-size="13">Rulebase</text><text x="435" y="124" text-anchor="middle" class="svg-muted" font-size="12">upar se neeche</text>
<rect x="540" y="20" width="85" height="44" rx="8" fill="#bbf7d0"/><text x="582" y="47" text-anchor="middle" class="svg-ink" font-size="13">Profiles</text>
<rect x="540" y="88" width="85" height="44" rx="8" fill="#bbf7d0"/><text x="582" y="115" text-anchor="middle" class="svg-ink" font-size="13">Action</text>
<rect x="540" y="156" width="85" height="44" rx="8" fill="#fed7aa"/><text x="582" y="183" text-anchor="middle" class="svg-ink" font-size="13">Log</text>
<line x1="135" y1="42" x2="200" y2="100" stroke="#64748b" stroke-width="2"/><line x1="135" y1="110" x2="200" y2="110" stroke="#64748b" stroke-width="2"/><line x1="135" y1="178" x2="200" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="110" x2="380" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="100" x2="540" y2="42" stroke="#64748b" stroke-width="2"/><line x1="490" y1="110" x2="540" y2="110" stroke="#64748b" stroke-width="2"/><line x1="490" y1="120" x2="540" y2="178" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen entrances, ek zone mapping step, ek rulebase. Result hota hai action, profile inspection aur ek log entry.</p></div>

<h3>Key terms</h3>
<dl class="terms">
<dt>Zone</dt><dd>Network entry ya exit points ke group ka label. Rules source zone aur destination zone par match karte hain. Prisma Access teen zones banata hai: Trust, Untrust aur Clientless VPN.</dd>
<dt>Security rule</dt><dd>Policy ki ek line: match conditions (zones, addresses, users, applications) plus action (allow ya deny) aur optional profiles aur logging.</dd>
<dt>App-ID</dt><dd>Palo Alto Networks application identification. Rules sirf port nahi, application ka naam likhte hain (jaise ssl ya web-browsing).</dd>
<dt>Security profile</dt><dd>Allow rule se attach hone wali deep inspection: threats, malware, URL categories aur bahut kuch.</dd>
<dt>Panorama aur SCM</dt><dd>Do management tools. Panorama (Cloud Services plugin ke saath) device groups aur templates use karta hai. SCM folders aur snippets use karta hai. Rules ka idea dono mein same hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Home laptop (203.0.113.50) GlobalProtect se connect hota hai aur mobile pool 10.200.0.0/23 se address leta hai. User HQ data centre mein internal app 10.10.0.50 kholta hai. Flow Prisma Access mein aata hai, zone mapping se destination ek zone mein rakha jata hai, rulebase upar se padha jata hai, pehla matching rule decide karta hai, aur traffic log rule ka naam record karta hai. Wahi user jab public site kholta hai to destination zone alag hota hai, isliye alag rule match hota hai. Same user, same entrance, do alag outcomes. Poora module is ek kahani mein hai.</p></div>

<h3>Policy alag topic kyun hai</h3>
<p>Connectivity modules poochhte hain "kya packet wahan pahunch sakta hai?". Policy poochhti hai "kya pahunchna chahiye?". Tunnel bilkul healthy ho sakta hai aur phir bhi users block ho sakte hain kyunki koi rule allow nahi karta, ya us se bura, ek wide rule upar hone se zyada allow ho jata hai. Cloud security service mein policy hi wo product hai jiske liye customer pay karta hai, isliye yahan ki galti security risk bhi hai aur support ticket bhi.</p>

<div class="note"><p><b>Teaching model.</b> Real Prisma Access console ek cloud service hai. Is course mein hum tenant, zones, rules aur logs ka simplified model use karte hain taaki aap logic practise kar sako. Jahan real product mein extra screens hain, chapters batate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Healthy tunnel ka matlab traffic allowed samajhna; zone mapping decide kiye bina rules likhna; Panorama aur SCM ko alag security engines maanna (engine ka idea same hai, sirf container aur menus alag hain).</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy zones ke beech enforce hoti hai. Destination default zone mein chhoot gaya to data-centre zone ke liye likhe rules kabhi match nahi honge. Pehle poochho: ye traffic kaunse zone mein hai?</p></div>

<div class="scn"><h4>Tunnel green tha, app dead thi</h4><p>Naya data-centre subnet onboard hone ke baad service connection healthy dikha raha tha, phir bhi mobile users HQ app 10.10.0.50 nahi khol paa rahe the. Engineer ne tunnel ko haath nahi lagaya. Traffic log mein flow final deny rule se match ho raha tha kyunki data-centre destination abhi default untrust zone mein tha. Zone ko trusted mein move karke push karne se fix ho gaya.</p><p><b>Lesson:</b> healthy transport ka matlab permitted traffic nahi. Connectivity chhedne se pehle log padho.</p></div>

<div class="iv"><p class="q">"Prisma Access deployment mein security policy kahan fit hoti hai?"</p><p>Connectivity ke baad: teeno attachment types (mobile users, remote networks, service connections) ek policy engine mein feed hote hain. Pehle zone mapping batao, phir rules upar se neeche, phir profiles aur logs. Ye bhi jodo ki policy Panorama device groups ya SCM folders se manage hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har entrance ka har flow same policy engine se guzarta hai.</li>
<li>Zones pehle aate hain: rules source aur destination zone par match karte hain.</li>
<li>Rule mein match conditions, action, profiles aur logging hote hain.</li>
<li>Panorama aur SCM mein containers aur menus alag hain, policy ka idea nahi.</li>
<li>Healthy tunnel permitted traffic prove nahi karta; traffic log karta hai.</li>
</ul></div>
`}};export{e as default};