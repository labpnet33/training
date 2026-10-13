var e={id:`access-policy-and-client-connector`,h:{en:`Access policy and the client connector`,hi:`Access policy aur client connector`},body:{en:`
<h3>The guest list at the door</h3>
<p>Publishing an app only says the room exists. The <b>access policy</b> is the guest list at the door: who may enter which room. It is a list of ordered rules. Each rule has user <b>groups</b>, <b>segment groups</b>, and an action (allow or deny). The engine walks from the top and the <b>first rule that matches both the user's group and the app's segment group decides</b>. If no rule matches, the answer is the <b>implicit deny</b> at the end: invisible, always there, and the reason a new app is unreachable until someone allows it. That is a key difference from the web pipeline, where the default was allow.</p>
<table class="cmp"><tr><th>#</th><th>Rule</th><th>Groups</th><th>Segment groups</th><th>Action</th></tr>
<tr><td>1</td><td>Eng-dev-apps</td><td>Engineering</td><td>Chennai-apps</td><td>allow</td></tr>
<tr><td>2</td><td>Finance-erp</td><td>Finance</td><td>Pune-apps</td><td>allow</td></tr>
<tr><td>3</td><td>HR-portal</td><td>HR</td><td>HR-apps</td><td>allow</td></tr>
<tr><td>-</td><td>implicit deny</td><td>everyone</td><td>everything</td><td>deny</td></tr></table>
<p>Lab zs-zpa-2 asks you to build exactly this kind of list: each group gets its apps and nothing more. Test two users per rule: one who should get in and one who should not.</p>

<h3>The client side: how the laptop knows what is private</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Client decision for a name">
<rect x="10" y="10" width="170" height="50" rx="8" fill="#bae6fd"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="12">User opens erp.corp.example</text>
<rect x="230" y="10" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">On the client bypass list?</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="11">yes: never reaches private access</text>
<rect x="460" y="10" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="545" y="32" text-anchor="middle" class="svg-ink" font-size="12">Private access enabled</text><text x="545" y="48" text-anchor="middle" class="svg-muted" font-size="11">in the client profile?</text>
<rect x="230" y="110" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Segment match, policy,</text><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">connector path</text>
<line x1="180" y1="35" x2="230" y2="35" stroke="#64748b" stroke-width="2"/><line x1="410" y1="35" x2="460" y2="35" stroke="#64748b" stroke-width="2"/><line x1="545" y1="60" x2="410" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The client decides first; only then does the cloud evaluate policy.</p></div>
<p>The client connector must be installed, signed in (SAML, from zs-id) and running, and the profile must have private access switched on. Then, for a private domain, two things happen. First the client's DNS handling hands the application a <b>synthetic address</b>: a stand-in address that does not belong to the real server. Think of a coat-check token. The application connects to the token address, the client connector recognises it, and steers the traffic into its tunnel toward the broker, which maps it back to the real domain. The exact range is vendor specific and belongs to vendor documentation. Practical effect: <code>nslookup erp.corp.example</code> on a working remote laptop shows an address that is not 10.1.20.10, and that is normal.</p>
<pre class="out">C:\\&gt; zapp status
Client connector: installed, signed in as vikram, enabled
Mode: tunnel   Private access: enabled
C:\\&gt; nslookup git.corp.example
Name:    git.corp.example
Address: <span class="hl">synthetic address (stand-in, not the real server)</span></pre>

<h3>The domain bypass trap</h3>
<p>The client profile has a <b>bypass list</b> of domains and IPs that should skip the tunnel and go direct, useful for local printers or video apps. Now the trap: if a <b>corporate domain</b> such as corp.example gets onto that list, the client sends erp.corp.example straight to the user's home network, where it does not exist. The name is never handed a synthetic address, and private access never even sees the request. This is ticket 321080: the remote user cannot reach the ERP, although segments and policy are perfect. A bypass is evaluated before everything in the cloud, so the cloud cannot fix it.</p>

<h3>Users on the LAN</h3>
<p>A user who is already on the LAN of the app's own site, for example ravi in Pune reaching the ERP in Pune, reaches it directly. No need to detour through the cloud. Remote users and users at other sites go through the broker and the connector.</p>

<h3>Design for least privilege (ticket 321100 preview)</h3>
<p>The change request: contractors may use only the file server, not the ERP. The clean design is two segment groups, say Contractor-apps containing files only and Pune-apps containing erp and hr, and a rule allowing Contractors only on Contractor-apps. Because of implicit deny, nothing else needs to be written. We practise it in chapter 4.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> An allow rule lets the broker splice the user's outbound connection to the connector's outbound connection for that segment group. A deny rule, or no rule, means the splice never happens and the user sees a failure. The bypass list changes which packets even enter the tunnel. Neither changes anything on the app server.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Putting a broad deny above a specific allow. (2) Writing rules with the wrong group name. (3) Adding the corporate domain to the bypass list "for speed". (4) Expecting a new app to work before any rule allows it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Implicit deny: "no matching rule" means denied. The bypass check comes before the cloud policy.</p></div>

<div class="scn"><h4>Everyone worked except one team</h4><p>After a rollout the Sales team in Jaipur could not reach the ERP while Finance could. The policy list had a deny rule for Sales that sat above the allow added later. Moving the allow up, or deleting the old deny, restored access.</p><p><b>Lesson:</b> when a group works elsewhere and fails here, read the rule order for that group.</p></div>

<div class="iv"><p class="q">"How does the client know to send a request to private access?"</p><p>The client connector is signed in with private access enabled, the domain is not on the bypass list, the name is answered with a synthetic address and steered into the tunnel. The cloud then matches a segment and evaluates the access policy with implicit deny.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access policy is ordered, first match wins, implicit deny at the end.</li>
<li>Rules pair user groups with segment groups.</li>
<li>Synthetic addresses steer private traffic into the client tunnel.</li>
<li>A corporate domain on the bypass list makes private apps unreachable.</li>
<li>Users on the app's own site LAN reach it directly.</li>
</ul></div>
`,hi:`
<h3>Darwaze par guest list</h3>
<p>App publish karne se sirf yeh pata chalta hai ki room hai. <b>Access policy</b> darwaze par guest list hai: kaun kis room mein ja sakta hai. Yeh ordered rules ki list hai. Har rule mein user <b>groups</b>, <b>segment groups</b> aur action (allow ya deny) hota hai. Engine upar se chalta hai aur <b>pehla rule jo user ke group aur app ke segment group dono se match kare, wahi decide karta hai</b>. Koi rule match na kare to aakhir mein <b>implicit deny</b> hai: dikhta nahi, hamesha rehta hai, aur isiliye nayi app tab tak unreachable rehti hai jab tak koi allow na kare. Web pipeline se yeh bada farak hai, jahan default allow tha.</p>
<table class="cmp"><tr><th>#</th><th>Rule</th><th>Groups</th><th>Segment groups</th><th>Action</th></tr>
<tr><td>1</td><td>Eng-dev-apps</td><td>Engineering</td><td>Chennai-apps</td><td>allow</td></tr>
<tr><td>2</td><td>Finance-erp</td><td>Finance</td><td>Pune-apps</td><td>allow</td></tr>
<tr><td>3</td><td>HR-portal</td><td>HR</td><td>HR-apps</td><td>allow</td></tr>
<tr><td>-</td><td>implicit deny</td><td>everyone</td><td>everything</td><td>deny</td></tr></table>
<p>Lab zs-zpa-2 mein aap bilkul aisi hi list banate ho: har group ko uski apps milti hain aur kuch zyada nahi. Har rule ke liye do users test karo: ek jise andar aana chahiye aur ek jise nahi.</p>

<h3>Client side: laptop ko kaise pata ki kya private hai</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Name ke liye client decision">
<rect x="10" y="10" width="170" height="50" rx="8" fill="#bae6fd"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="12">User erp.corp.example kholta hai</text>
<rect x="230" y="10" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">Client bypass list mein hai?</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="11">haan: private access tak nahi pahunchta</text>
<rect x="460" y="10" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="545" y="32" text-anchor="middle" class="svg-ink" font-size="12">Private access enabled</text><text x="545" y="48" text-anchor="middle" class="svg-muted" font-size="11">client profile mein?</text>
<rect x="230" y="110" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Segment match, policy,</text><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">connector path</text>
<line x1="180" y1="35" x2="230" y2="35" stroke="#64748b" stroke-width="2"/><line x1="410" y1="35" x2="460" y2="35" stroke="#64748b" stroke-width="2"/><line x1="545" y1="60" x2="410" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Client pehle decide karta hai; uske baad hi cloud policy evaluate karta hai.</p></div>
<p>Client connector installed, signed in (SAML, zs-id se) aur running hona chahiye, aur profile mein private access on hona chahiye. Phir private domain ke liye do cheezein hoti hain. Pehle client ka DNS handling application ko ek <b>synthetic address</b> deta hai: ek stand-in address jo asli server ka nahi hota. Coat-check token ki tarah socho. Application token address se connect karti hai, client connector use pehchanta hai, aur traffic ko apne tunnel mein broker ki taraf steer karta hai, jo use wapas asli domain se map karta hai. Exact range vendor specific hai aur vendor documentation ka hissa hai. Practical asar: chalte hue remote laptop par <code>nslookup erp.corp.example</code> aisa address dikhata hai jo 10.1.20.10 nahi hai, aur yeh normal hai.</p>
<pre class="out">C:\\&gt; zapp status
Client connector: installed, signed in as vikram, enabled
Mode: tunnel   Private access: enabled
C:\\&gt; nslookup git.corp.example
Name:    git.corp.example
Address: <span class="hl">synthetic address (stand-in, not the real server)</span></pre>

<h3>Domain bypass ka trap</h3>
<p>Client profile mein domains aur IPs ki ek <b>bypass list</b> hoti hai jo tunnel skip karke direct jaate hain, local printers ya video apps ke liye useful. Ab trap: agar corp.example jaisa koi <b>corporate domain</b> us list mein aa jaye, to client erp.corp.example ko seedha user ke home network par bhej deta hai, jahan woh exist hi nahi karta. Name ko synthetic address kabhi milta nahi, aur private access ko request dikhti hi nahi. Yahi ticket 321080 hai: remote user ERP reach nahi kar pa raha, jabki segments aur policy perfect hain. Bypass cloud ki har cheez se pehle evaluate hota hai, isliye cloud use fix nahi kar sakta.</p>

<h3>LAN par baithe users</h3>
<p>Jo user app ki apni site ke LAN par pehle se hai, jaise Pune mein ravi Pune ke ERP ko, woh use seedha reach karta hai. Cloud se ghoomne ki zaroorat nahi. Remote users aur doosri sites ke users broker aur connector se jaate hain.</p>

<h3>Least privilege ke liye design (ticket 321100 preview)</h3>
<p>Change request: contractors sirf file server use karein, ERP nahi. Clean design: do segment groups, maan lo Contractor-apps jisme sirf files hai aur Pune-apps jisme erp aur hr, aur ek rule jo Contractors ko sirf Contractor-apps par allow kare. Implicit deny ki wajah se baaki kuch likhna nahi padta. Isse hum chapter 4 mein practise karenge.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Allow rule broker ko user ke outbound connection ko us segment group ke liye connector ke outbound connection se splice karne deta hai. Deny rule ya koi rule nahi ka matlab splice kabhi nahi hota aur user ko failure dikhta hai. Bypass list badalti hai ki kaun se packets tunnel mein jaate hi hain. Dono app server par kuch nahi badalte.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Broad deny ko specific allow ke upar rakhna. (2) Rules mein galat group name likhna. (3) Corporate domain ko "speed ke liye" bypass list mein daalna. (4) Kisi rule ke allow kiye bina nayi app ke chalne ki umeed karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Implicit deny: "koi matching rule nahi" ka matlab denied. Bypass check cloud policy se pehle aata hai.</p></div>

<div class="scn"><h4>Ek team ko chhodkar sab ke liye chala</h4><p>Rollout ke baad Jaipur ki Sales team ERP reach nahi kar pa rahi thi jabki Finance kar rahi thi. Policy list mein Sales ke liye ek deny rule tha jo baad mein add hue allow ke upar baitha tha. Allow ko upar le jaane ya purana deny hatane se access wapas aa gaya.</p><p><b>Seekh:</b> jab group kahin aur chalta ho aur yahan fail ho, us group ke liye rule order padho.</p></div>

<div class="iv"><p class="q">"Client ko kaise pata chalta hai ki request private access ko bhejni hai?"</p><p>Client connector signed in hai aur private access enabled hai, domain bypass list mein nahi hai, name ko synthetic address milta hai aur tunnel mein steer hota hai. Phir cloud segment match karta hai aur implicit deny ke saath access policy evaluate karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access policy ordered hai, first match wins, aakhir mein implicit deny.</li>
<li>Rules user groups ko segment groups se jodte hain.</li>
<li>Synthetic addresses private traffic ko client tunnel mein steer karte hain.</li>
<li>Bypass list mein corporate domain private apps ko unreachable bana deta hai.</li>
<li>App ki apni site ke LAN ke users use seedha reach karte hain.</li>
</ul></div>
`}};export{e as default};