var e={id:`policy-groups`,h:{en:`Policy groups and choosing the right tool: templates, groups or policy`,hi:`Policy groups aur sahi tool chunna: templates, groups ya policy`},body:{en:`
<p>A company has two kinds of documents. One says <b>what each office is</b>: the address, the phone lines, the equipment. The other says <b>how traffic of people and goods must behave</b>: which road trucks use, which gate guests use. In SD-WAN the first kind is the <b>device configuration</b> (templates and configuration groups). The second kind is <b>policy</b>: rules for routes, traffic paths, applications and security. In recent releases there is a modern, guided way to build policy too: <b>policy groups</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Configuration versus policy">
<rect x="10" y="10" width="300" height="210" rx="10" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="14">Device configuration</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">What the router IS</text>
<text x="160" y="95" text-anchor="middle" class="svg-ink" font-size="12">Legacy: feature, device and CLI templates</text><text x="160" y="118" text-anchor="middle" class="svg-ink" font-size="12">Modern: configuration groups + profiles</text><text x="160" y="150" text-anchor="middle" class="svg-muted" font-size="12">Menu: Configuration &gt; Templates /</text><text x="160" y="168" text-anchor="middle" class="svg-muted" font-size="12">Configuration &gt; Configuration Groups</text>
<rect x="330" y="10" width="300" height="210" rx="10" fill="#ddd6fe"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="14">Policy</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">How routes and traffic BEHAVE</text>
<text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="12">Classic: centralized and localized policy</text><text x="480" y="118" text-anchor="middle" class="svg-ink" font-size="12">Modern: policy groups</text><text x="480" y="150" text-anchor="middle" class="svg-muted" font-size="12">Menu: Configuration &gt; Policies /</text><text x="480" y="168" text-anchor="middle" class="svg-muted" font-size="12">Configuration &gt; Policy Groups</text>
</svg><p class="cap">Configuration says what a device is; policy says how the fabric treats routes and traffic.</p></div>

<h3>What a policy group is</h3>
<p>A <b>policy group</b> is a reusable, structured collection of policies that you build with guided workflows and deploy to many sites. It was introduced with Cisco IOS XE Catalyst SD-WAN Release 17.12.1a and Catalyst SD-WAN Manager Release 20.12.1. Typical building blocks include:</p>
<ul>
<li><b>Application priority and SLA</b>: classify traffic by application and set which path or SLA it should use. This simplifies the application-aware routing you study in a later module.</li>
<li><b>Quality of service</b>: marking and queuing treatment.</li>
<li><b>Embedded security</b>: firewall and threat protection on the edge.</li>
<li><b>Secure Internet Gateway (SIG)</b>: tunnels toward a cloud security service.</li>
<li><b>DNS security</b>: filtering of DNS lookups.</li>
<li><b>Topology</b>: the connectivity design, for example hub-and-spoke or mesh, built with a guided flow.</li>
</ul>
<p>Groups of interest, such as application lists and prefix lists, live in the <b>policy object</b> area and are referenced by the policy group.</p>

<h3>Click path</h3>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Policy Groups</b>.</li>
<li>Click <b>Add Policy Group</b>.</li>
<li>Name it and add the policy components you want (for example application priority and SLA, embedded security).</li>
<li>Save it, then make sure the target devices belong to a configuration group.</li>
<li>Deploy through the configuration group workflow from the previous chapter.</li>
</ol>
<p>The key rule: a <b>policy group is deployed through a configuration group</b>. A device must first be managed by a configuration group before a policy group can be applied to it. A device that is still managed by a legacy device template uses the classic centralized and localized policy path.</p>

<h3>How it relates to centralized policy</h3>
<p>Policy groups are a simplified, workflow-driven alternative to building centralized policy by hand. The underlying policy architecture is the same: the Controller still distributes control policy, and edges still enforce data policy. In the classic path, you build lists, policies and the <code>apply-policy</code> block yourself under <b>Configuration</b> &gt; <b>Policies</b>. The next module, <i>Centralized control policy</i>, teaches that classic path in depth, because it is the one most often tested and the one you will see in older networks.</p>
<p>One limitation noted in the documentation: when you use dual-router configuration groups together with policy groups, you cannot reuse the same VPN value across devices. This restriction does not apply to standard configuration groups.</p>

<h3>Which tool for which job</h3>
<table class="cmp"><tr><th>Need</th><th>Use</th></tr>
<tr><td>Define a router's system, transport, VPNs and interfaces in an older network</td><td>Feature templates + device template</td></tr>
<tr><td>A feature the GUI does not offer</td><td>CLI add-on template (or CLI add-on profile)</td></tr>
<tr><td>Define the same in a new or migrated network, guided and model agnostic</td><td>Configuration group with profiles</td></tr>
<tr><td>Hub-and-spoke or other route control, advanced custom control policy</td><td>Centralized control policy (Controller)</td></tr>
<tr><td>Guided policy: application SLA, security, DIA, topology across many sites</td><td>Policy groups through configuration groups</td></tr>
<tr><td>Bring a new router online and give it first settings</td><td>Workflow Library guided workflow</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bharat Retail has 3 hubs and 250 branches. The router design (system, transport, LAN VPN 10) is a configuration group, deployed by tag rule. The policy to prefer MPLS for voice and the internet for web, plus an embedded firewall for the guest VPN, is a policy group deployed through that same configuration group. The hub-and-spoke control rules that force branch traffic through the Delhi hub are a centralized control policy, built and activated on the Controller.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trying to deploy a policy group to a device that is still on a device template; mixing classic centralized policy and a policy group that both change the same behaviour; assuming workflows replace the need to understand policy; and treating "configuration" and "policy" as the same thing.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy groups appeared in Release 20.12 and 17.12; they are deployed through configuration groups; they simplify, but do not replace the concept of, centralized policy. The menu is Configuration &gt; Policy Groups.</p></div>

<div class="scn"><h4>The policy that would not apply</h4><p>An engineer built a policy group for application SLA and tried to deploy it to E-MUM-1. The deployment option was missing. E-MUM-1 was still attached to a legacy device template. After he migrated the router to a configuration group (pilot, diff, deploy), the policy group appeared as an option and deployed.</p><p><b>Lesson:</b> a policy group needs a configuration group underneath it.</p></div>

<div class="iv"><p class="q">"What is a policy group and how is it different from a centralized policy?"</p><p>Strong answer: a policy group is a guided, reusable set of policies (application priority and SLA, QoS, embedded security, SIG, DNS security, topology) introduced in 20.12 and 17.12 and deployed through configuration groups. A centralized policy is the classic policy built under Configuration &gt; Policies and activated on the Controller. Same architecture, different workflow; use one or the other for a given behaviour.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration is what a device is; policy is how routes and traffic behave.</li>
<li>Policy groups: guided, reusable, introduced in 20.12 / 17.12, found at Configuration &gt; Policy Groups.</li>
<li>They are deployed through configuration groups; the device must be managed by one.</li>
<li>Classic centralized policy still exists and is the subject of the next module.</li>
<li>Pick the tool by the job: templates, CLI add-on, configuration groups, centralized policy or policy groups.</li>
</ul></div>
`,hi:`
<p>Ek company ke paas do tarah ke documents hote hain. Ek batata hai ki <b>har office kya hai</b>: address, phone lines, equipment. Doosra batata hai ki <b>logon aur maal ka traffic kaise behave karega</b>: trucks kaunsi road lenge, guests kaunsa gate. SD-WAN mein pehli tarah ka document <b>device configuration</b> hai (templates aur configuration groups). Doosri tarah ka <b>policy</b> hai: routes, traffic paths, applications aur security ke rules. Recent releases mein policy banane ka bhi ek modern, guided tareeka hai: <b>policy groups</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Configuration versus policy">
<rect x="10" y="10" width="300" height="210" rx="10" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="14">Device configuration</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">Router KYA HAI</text>
<text x="160" y="95" text-anchor="middle" class="svg-ink" font-size="12">Legacy: feature, device aur CLI templates</text><text x="160" y="118" text-anchor="middle" class="svg-ink" font-size="12">Modern: configuration groups + profiles</text><text x="160" y="150" text-anchor="middle" class="svg-muted" font-size="12">Menu: Configuration &gt; Templates /</text><text x="160" y="168" text-anchor="middle" class="svg-muted" font-size="12">Configuration &gt; Configuration Groups</text>
<rect x="330" y="10" width="300" height="210" rx="10" fill="#ddd6fe"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="14">Policy</text><text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">Routes aur traffic KAISE BEHAVE karte hain</text>
<text x="480" y="95" text-anchor="middle" class="svg-ink" font-size="12">Classic: centralized aur localized policy</text><text x="480" y="118" text-anchor="middle" class="svg-ink" font-size="12">Modern: policy groups</text><text x="480" y="150" text-anchor="middle" class="svg-muted" font-size="12">Menu: Configuration &gt; Policies /</text><text x="480" y="168" text-anchor="middle" class="svg-muted" font-size="12">Configuration &gt; Policy Groups</text>
</svg><p class="cap">Configuration batati hai device kya hai; policy batati hai fabric routes aur traffic ko kaise treat karta hai.</p></div>

<h3>Policy group kya hai</h3>
<p><b>Policy group</b> policies ka reusable, structured collection hai jo aap guided workflows se banate ho aur kai sites par deploy karte ho. Yeh Cisco IOS XE Catalyst SD-WAN Release 17.12.1a aur Catalyst SD-WAN Manager Release 20.12.1 ke saath aaya. Typical building blocks:</p>
<ul>
<li><b>Application priority and SLA</b>: traffic ko application se classify karo aur set karo ki woh kaunsa path ya SLA use kare. Yeh application-aware routing ko simplify karta hai jo aap aage ke module mein padhoge.</li>
<li><b>Quality of service</b>: marking aur queuing treatment.</li>
<li><b>Embedded security</b>: edge par firewall aur threat protection.</li>
<li><b>Secure Internet Gateway (SIG)</b>: cloud security service ki taraf tunnels.</li>
<li><b>DNS security</b>: DNS lookups ki filtering.</li>
<li><b>Topology</b>: connectivity design, jaise hub-and-spoke ya mesh, guided flow se bana.</li>
</ul>
<p>Groups of interest, jaise application lists aur prefix lists, <b>policy object</b> area mein rehte hain aur policy group unka reference deta hai.</p>

<h3>Click path</h3>
<ol>
<li><b>Configuration</b> &gt; <b>Policy Groups</b> kholo.</li>
<li><b>Add Policy Group</b> click karo.</li>
<li>Naam do aur jo policy components chahiye woh jodo (jaise application priority and SLA, embedded security).</li>
<li>Save karo, phir pakka karo ki target devices kisi configuration group mein hain.</li>
<li>Pichhle chapter ke configuration group workflow se deploy karo.</li>
</ol>
<p>Mukhya rule: <b>policy group configuration group ke zariye deploy hota hai</b>. Device pehle configuration group se managed hona chahiye, tab policy group us par lag sakta hai. Jo device abhi legacy device template par hai woh classic centralized aur localized policy path use karta hai.</p>

<h3>Centralized policy se relation</h3>
<p>Policy groups hath se centralized policy banane ka simplified, workflow-driven alternative hain. Underlying policy architecture wahi hai: Controller abhi bhi control policy distribute karta hai, aur edges abhi bhi data policy enforce karte hain. Classic path mein aap lists, policies aur <code>apply-policy</code> block khud <b>Configuration</b> &gt; <b>Policies</b> ke neeche banate ho. Agla module, <i>Centralized control policy</i>, us classic path ko depth mein padhata hai, kyunki woh sabse zyada tested hai aur purane networks mein wahi dikhega.</p>
<p>Documentation mein ek limitation likhi hai: jab aap dual-router configuration groups ko policy groups ke saath use karte ho, to aap alag devices mein same VPN value reuse nahi kar sakte. Yeh restriction standard configuration groups par lagu nahi hoti.</p>

<h3>Kaunsa tool kis kaam ke liye</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Use karo</th></tr>
<tr><td>Purane network mein router ke system, transport, VPNs aur interfaces define karna</td><td>Feature templates + device template</td></tr>
<tr><td>Aisa feature jo GUI nahi deta</td><td>CLI add-on template (ya CLI add-on profile)</td></tr>
<tr><td>Naye ya migrated network mein wahi, guided aur model agnostic</td><td>Profiles ke saath configuration group</td></tr>
<tr><td>Hub-and-spoke ya doosra route control, advanced custom control policy</td><td>Centralized control policy (Controller)</td></tr>
<tr><td>Kai sites par guided policy: application SLA, security, DIA, topology</td><td>Configuration groups ke zariye policy groups</td></tr>
<tr><td>Naya router online laana aur use pehli settings dena</td><td>Workflow Library ka guided workflow</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ke 3 hubs aur 250 branches hain. Router design (system, transport, LAN VPN 10) ek configuration group hai, tag rule se deploy hota hai. Voice ke liye MPLS aur web ke liye internet prefer karne wali policy, plus guest VPN ke liye embedded firewall, ek policy group hai jo usi configuration group ke zariye deploy hota hai. Hub-and-spoke control rules jo branch traffic ko Delhi hub se guzaarte hain, ek centralized control policy hai, jo Controller par banai aur activate ki jaati hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Aise device par policy group deploy karne ki koshish jo abhi device template par hai; classic centralized policy aur policy group ko mix karna jo dono ek hi behaviour badalte hain; yeh maan lena ki workflows policy samajhne ki zaroorat khatam kar dete hain; aur "configuration" aur "policy" ko ek hi cheez samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy groups Release 20.12 aur 17.12 mein aaye; woh configuration groups ke zariye deploy hote hain; woh centralized policy ke concept ko simplify karte hain, replace nahi. Menu Configuration &gt; Policy Groups hai.</p></div>

<div class="scn"><h4>Policy jo apply nahi ho rahi thi</h4><p>Ek engineer ne application SLA ke liye policy group banaya aur use E-MUM-1 par deploy karne ki koshish ki. Deployment option missing tha. E-MUM-1 abhi bhi legacy device template se attached tha. Router ko configuration group mein migrate karne ke baad (pilot, diff, deploy), policy group option dikha aur deploy ho gaya.</p><p><b>Seekh:</b> policy group ke neeche configuration group chahiye.</p></div>

<div class="iv"><p class="q">"Policy group kya hai aur centralized policy se kaise alag hai?"</p><p>Strong answer: policy group policies ka guided, reusable set hai (application priority and SLA, QoS, embedded security, SIG, DNS security, topology) jo 20.12 aur 17.12 mein aaya aur configuration groups ke zariye deploy hota hai. Centralized policy classic policy hai jo Configuration &gt; Policies ke neeche banti hai aur Controller par activate hoti hai. Architecture same, workflow alag; ek behaviour ke liye ek hi use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration batati hai device kya hai; policy batati hai routes aur traffic kaise behave karte hain.</li>
<li>Policy groups: guided, reusable, 20.12 / 17.12 mein aaye, Configuration &gt; Policy Groups par.</li>
<li>Woh configuration groups ke zariye deploy hote hain; device kisi ek se managed hona chahiye.</li>
<li>Classic centralized policy abhi bhi hai aur agle module ka subject hai.</li>
<li>Kaam ke hisaab se tool chuno: templates, CLI add-on, configuration groups, centralized policy ya policy groups.</li>
</ul></div>
`}};export{e as default};