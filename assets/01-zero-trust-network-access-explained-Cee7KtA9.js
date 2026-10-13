var e={id:`zero-trust-network-access-explained`,h:{en:`Zero trust network access explained: VPN versus inside-out`,hi:`Zero trust network access explained: VPN versus inside-out`},body:{en:`
<h3>What you will learn</h3>
<p>This module is about reaching <b>private applications</b>: the ERP, the HR portal, the file server and the git server that live inside Sahyadri Logistics, not on the public internet. You will learn how zero trust network access works, how to publish an application, how to write the access policy, and how to troubleshoot "I cannot reach it". <b>Prerequisites:</b> zs-start, zs-fwd (the client connector) and basic networking: IP, DNS, ports, NAT and what a VPN does. In the vendor's own wording the private-access service is called ZPA; the simulator uses generic page names. Exact vendor values always come from the vendor documentation.</p>

<h3>The old way: VPN is a long corridor</h3>
<p>A traditional VPN is like giving a visitor a key card for the whole building. Once the tunnel is up, the laptop gets an address on the corporate network and can usually <b>talk to anything routable</b>. Meanwhile the data centre must accept inbound connections from the internet at a VPN concentrator, a juicy target. If one contractor laptop is infected, the infection can walk the corridor.</p>

<h3>The new way: ZTNA is a guided escort</h3>
<p><b>ZTNA</b> (zero trust network access) works like a receptionist who escorts a visitor to exactly one meeting room. The user is never placed on the network. Instead the user is connected to <b>one named application</b>, and only if policy says so. The underlying idea, <b>zero trust</b>, is: never trust a request just because of where it comes from; verify the user and the device, and give only the access that is needed (least privilege).</p>
<table class="cmp"><tr><th></th><th>Traditional VPN</th><th>ZTNA</th></tr>
<tr><td>What the user gets</td><td>network-level access</td><td>access to named applications</td></tr>
<tr><td>Inbound ports at the office</td><td>needed on the VPN device</td><td>none</td></tr>
<tr><td>Decision based on</td><td>being connected</td><td>user, group and application</td></tr>
<tr><td>Spread of an infection</td><td>wide</td><td>limited to allowed apps</td></tr></table>

<h3>Inside-out connections</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Inside-out connections">
<rect x="10" y="70" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="97" text-anchor="middle" class="svg-ink" font-size="12">User laptop</text><text x="65" y="114" text-anchor="middle" class="svg-muted" font-size="11">client connector</text>
<rect x="250" y="55" width="140" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Cloud broker</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="11">checks policy</text>
<rect x="520" y="20" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="46" text-anchor="middle" class="svg-ink" font-size="12">App connector</text><text x="575" y="63" text-anchor="middle" class="svg-muted" font-size="11">inside the site</text>
<rect x="520" y="120" width="110" height="60" rx="8" fill="#fde68a"/><text x="575" y="156" text-anchor="middle" class="svg-ink" font-size="12">Private app</text>
<line x1="120" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="520" y1="50" x2="390" y2="90" stroke="#64748b" stroke-width="2"/><line x1="575" y1="80" x2="575" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="185" y="90" text-anchor="middle" class="svg-muted" font-size="11">outbound</text><text x="470" y="62" text-anchor="middle" class="svg-muted" font-size="11">outbound</text>
</svg><p class="cap">Both ends dial out to the broker; nothing dials in to the site.</p></div>
<p>Here is the trick. A small program called the <b>app connector</b> runs inside the site, for example APPCONN-PUN at 10.1.20.50 next to the ERP. It makes an <b>outbound</b> connection to the cloud. That is allowed by almost every firewall, like an employee phoning out. The user's <b>client connector</b> also connects outbound to the cloud. The broker joins the two connections only after policy says yes. Because both sides dial out, the site needs no inbound hole, and the app has no public address that attackers can scan. This is the generic idea of an inside-out connection.</p>

<h3>Sahyadri's private apps</h3>
<table class="cmp"><tr><th>Application</th><th>Where</th><th>Port</th></tr>
<tr><td>erp.corp.example</td><td>Pune</td><td>tcp 443</td></tr>
<tr><td>hr.corp.example</td><td>Pune</td><td>tcp 8443</td></tr>
<tr><td>files.corp.example</td><td>Chennai</td><td>tcp 445</td></tr>
<tr><td>git.corp.example</td><td>Chennai</td><td>tcp 22</td></tr></table>
<p>The chain we will build in the next chapters is: <b>application segment</b> (what the app is) goes into a segment group, points to a <b>server group</b>, which lists <b>connector groups</b> containing <b>connectors</b>. Then an <b>access policy</b> says who may use which segment group. A user on the LAN of the app's own site simply reaches it directly.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Publishing a private app changes no routing at the office and opens no firewall port. It adds an entry to the broker's list: "this domain and port belongs to this connector group". On the user's side, traffic for that domain is steered into the client connector's tunnel. Nothing leaves the connector's site except what policy allowed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking ZTNA is "VPN with a new name". (2) Believing the connector needs an inbound firewall rule. (3) Assuming a user who is signed in can see every app: access is per application. (4) Forgetting that the simulator, not the real product, defines our facts; exact values come from vendor documents.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which side initiates the connection?" Both connectors initiate outbound. That is why no inbound rules are needed.</p></div>

<div class="scn"><h4>The contractor who needed one server</h4><p>A contractor needed the file server for two weeks. Under the old VPN the company would have given a full tunnel and hoped for the best. With ZTNA the admin allowed one application for the Contractors group. When the contract ended, one policy line was removed and nothing else was touched.</p><p><b>Lesson:</b> grant applications, not networks.</p></div>

<div class="iv"><p class="q">"What is ZTNA and how is it different from a VPN?"</p><p>ZTNA connects an authenticated user to a specific application based on policy, without placing the device on the network. The connector dials out, so no inbound ports are open. A VPN grants network-level access. Mention zero trust and least privilege.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VPN gives network access; ZTNA gives access to named applications.</li>
<li>Zero trust means verify every request and grant least privilege.</li>
<li>Connector and client both dial outbound; the broker joins them after policy allows.</li>
<li>No inbound firewall holes and no public address for the private app.</li>
<li>The build chain: segment, segment group, server group, connector group, access policy.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Yeh module <b>private applications</b> tak pahunchne ke baare mein hai: ERP, HR portal, file server aur git server jo Sahyadri Logistics ke andar rehte hain, public internet par nahi. Aap seekhoge ki zero trust network access kaise kaam karta hai, application kaise publish karte hain, access policy kaise likhte hain, aur "reach nahi ho raha" ko troubleshoot kaise karte hain. <b>Prerequisites:</b> zs-start, zs-fwd (client connector) aur basic networking: IP, DNS, ports, NAT aur VPN kya karta hai. Vendor ki apni wording mein private-access service ZPA kehlaati hai; simulator generic page names use karta hai. Exact vendor values hamesha vendor documentation se aate hain.</p>

<h3>Purana tareeka: VPN ek lamba corridor hai</h3>
<p>Traditional VPN aisa hai jaise visitor ko poori building ka key card de dena. Tunnel up hote hi laptop ko corporate network par address milta hai aur woh aam taur par <b>kisi bhi routable cheez se baat kar sakta hai</b>. Saath hi data centre ko VPN concentrator par internet se inbound connections accept karne padte hain, jo ek bada target hai. Ek contractor laptop infected ho to infection corridor mein chal sakta hai.</p>

<h3>Naya tareeka: ZTNA ek guided escort hai</h3>
<p><b>ZTNA</b> (zero trust network access) us receptionist jaisa hai jo visitor ko sirf ek meeting room tak escort karta hai. User ko kabhi network par nahi rakha jaata. Uski jagah user ko <b>ek named application</b> se connect kiya jaata hai, aur tabhi jab policy haan kahe. Peeche ka idea, <b>zero trust</b>: sirf isliye request par bharosa mat karo ki woh kahan se aayi; user aur device verify karo, aur sirf zaroori access do (least privilege).</p>
<table class="cmp"><tr><th></th><th>Traditional VPN</th><th>ZTNA</th></tr>
<tr><td>User ko kya milta hai</td><td>network-level access</td><td>named applications ka access</td></tr>
<tr><td>Office mein inbound ports</td><td>VPN device par chahiye</td><td>koi nahi</td></tr>
<tr><td>Decision kis par</td><td>connected hone par</td><td>user, group aur application</td></tr>
<tr><td>Infection ka phailna</td><td>wide</td><td>sirf allowed apps tak</td></tr></table>

<h3>Inside-out connections</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Inside-out connections">
<rect x="10" y="70" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="97" text-anchor="middle" class="svg-ink" font-size="12">User laptop</text><text x="65" y="114" text-anchor="middle" class="svg-muted" font-size="11">client connector</text>
<rect x="250" y="55" width="140" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Cloud broker</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="11">policy check</text>
<rect x="520" y="20" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="46" text-anchor="middle" class="svg-ink" font-size="12">App connector</text><text x="575" y="63" text-anchor="middle" class="svg-muted" font-size="11">site ke andar</text>
<rect x="520" y="120" width="110" height="60" rx="8" fill="#fde68a"/><text x="575" y="156" text-anchor="middle" class="svg-ink" font-size="12">Private app</text>
<line x1="120" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="520" y1="50" x2="390" y2="90" stroke="#64748b" stroke-width="2"/><line x1="575" y1="80" x2="575" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="185" y="90" text-anchor="middle" class="svg-muted" font-size="11">outbound</text><text x="470" y="62" text-anchor="middle" class="svg-muted" font-size="11">outbound</text>
</svg><p class="cap">Dono ends broker ki taraf outbound dial karte hain; site ke andar koi dial-in nahi karta.</p></div>
<p>Yahi trick hai. <b>App connector</b> naam ka chhota program site ke andar chalta hai, jaise ERP ke paas APPCONN-PUN 10.1.20.50 par. Woh cloud ki taraf <b>outbound</b> connection banata hai. Yeh lagbhag har firewall allow karta hai, jaise employee bahar phone karta hai. User ka <b>client connector</b> bhi cloud ki taraf outbound connect karta hai. Broker dono connections ko tabhi jodta hai jab policy haan kahe. Dono taraf se dial out hone ke kaaran site ko inbound hole nahi chahiye, aur app ka koi public address nahi jise attackers scan karein. Yeh inside-out connection ka generic idea hai.</p>

<h3>Sahyadri ki private apps</h3>
<table class="cmp"><tr><th>Application</th><th>Kahan</th><th>Port</th></tr>
<tr><td>erp.corp.example</td><td>Pune</td><td>tcp 443</td></tr>
<tr><td>hr.corp.example</td><td>Pune</td><td>tcp 8443</td></tr>
<tr><td>files.corp.example</td><td>Chennai</td><td>tcp 445</td></tr>
<tr><td>git.corp.example</td><td>Chennai</td><td>tcp 22</td></tr></table>
<p>Agle chapters mein jo chain hum banayenge: <b>application segment</b> (app kya hai) segment group mein jaata hai, <b>server group</b> ki taraf point karta hai, jo <b>connector groups</b> list karta hai jinme <b>connectors</b> hain. Phir ek <b>access policy</b> kehti hai kaun kis segment group ko use kar sakta hai. App ki apni site ke LAN par baitha user use seedha reach kar leta hai.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Private app publish karne se office mein routing nahi badalti aur koi firewall port nahi khulta. Broker ki list mein ek entry judti hai: "yeh domain aur port is connector group ka hai". User ki side par us domain ka traffic client connector ke tunnel mein steer hota hai. Connector ki site se wahi nikalta hai jo policy ne allow kiya.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) ZTNA ko "naye naam ka VPN" samajhna. (2) Maanna ki connector ko inbound firewall rule chahiye. (3) Sochna ki signed-in user har app dekh sakta hai: access per application hota hai. (4) Yeh bhoolna ki hamare facts simulator define karta hai, real product nahi; exact values vendor documents se aate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Connection kaun initiate karta hai?" Dono connectors outbound initiate karte hain. Isliye inbound rules ki zaroorat nahi.</p></div>

<div class="scn"><h4>Contractor jise ek server chahiye tha</h4><p>Ek contractor ko do hafte ke liye file server chahiye tha. Purane VPN mein company full tunnel deti aur umeed karti. ZTNA mein admin ne Contractors group ke liye ek application allow ki. Contract khatam hone par policy ki ek line hata di gayi aur kuch aur chhua nahi gaya.</p><p><b>Seekh:</b> applications do, networks nahi.</p></div>

<div class="iv"><p class="q">"ZTNA kya hai aur VPN se kaise alag hai?"</p><p>ZTNA authenticated user ko policy ke basis par specific application se connect karta hai, device ko network par rakhe bina. Connector outbound dial karta hai, isliye inbound ports open nahi hote. VPN network-level access deta hai. Zero trust aur least privilege mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN network access deta hai; ZTNA named applications ka access deta hai.</li>
<li>Zero trust ka matlab har request verify karo aur least privilege do.</li>
<li>Connector aur client dono outbound dial karte hain; policy allow kare to broker dono ko jodta hai.</li>
<li>Koi inbound firewall hole nahi aur private app ka public address nahi.</li>
<li>Build chain: segment, segment group, server group, connector group, access policy.</li>
</ul></div>
`}};export{e as default};