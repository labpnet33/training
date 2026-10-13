var e={id:`multilink-outbound`,h:{en:`Multi-Link outbound: standby, balance and probing`,hi:`Multi-Link outbound: standby, balance aur probing`},body:{en:`
<p>A branch with one internet line is one cable cut away from being offline. <b>Multi-Link</b> lets an engine use two or more internet connections from different providers, so the branch survives when one fails. In this chapter you learn the outbound side and prepare lab fp-vpn-3.</p>

<h3>Analogy: two roads to the highway</h3>
<p>Your office has two roads out to the highway. One is the main road, the other a longer back road. If the main road is blocked, drivers must switch to the back road. But who tells the drivers the road is blocked? If nobody does, they keep queuing on the dead road. A <b>probe</b> is the traffic reporter who actually drives down the road and reports back.</p>

<h3>Links, modes and selection</h3>
<p>Each <b>link</b> in the model has a name, an interface, a gateway (the ISP router) and optionally a probe target. For Pune: link ISP1 on eth1 with gateway 203.0.113.1, and a second circuit ISP2 on another interface with its own gateway. The second circuit's addressing in the examples is illustrative; use the addressing shown in your lab.</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th><th>Use when</th></tr>
<tr><td><b>standby</b></td><td>The first alive link carries traffic. The next link is used only when the first is not alive.</td><td>A cheap or metered backup line</td></tr>
<tr><td><b>balance</b></td><td>All alive links carry traffic; connections are spread across them.</td><td>Two similar lines, you want the bandwidth of both</td></tr>
</table>
<p>With standby, order matters: list the preferred link first. With balance, a dead link is simply left out of the spread. Real products also offer weights and per-link priorities; check the documentation for your NGFW version.</p>

<h3>When is a link alive?</h3>
<p>The model uses a simple rule you must remember:</p>
<ul>
<li>A link is alive when its <b>interface is up</b> and, if a <b>probe target</b> is set, the gateway device can <b>reach the probe target</b>.</li>
<li>Without a probe, only the interface is checked.</li>
</ul>
<p>This is the key idea. Most ISP failures are not cable cuts at your door. The cable is fine, the interface stays up, but the ISP network behind it is broken. Without a probe, the engine believes the link is healthy and keeps sending traffic into the void. Users call it "the internet is slow or down" while the second line sits idle. With a probe to a reliable address beyond the ISP (for example a public address you are allowed to test, 192.0.2.53 in our example), the engine sees the failure and <b>withdraws</b> the link. Traffic moves to the next alive link.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two links with probes">
<rect x="10" y="85" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="70" y="130" text-anchor="middle" class="svg-muted" font-size="12">Multi-Link</text>
<rect x="260" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="315" y="48" text-anchor="middle" class="svg-ink" font-size="13">ISP1 router</text>
<rect x="260" y="164" width="110" height="46" rx="8" fill="#fed7aa"/><text x="315" y="192" text-anchor="middle" class="svg-ink" font-size="13">ISP2 router</text>
<rect x="500" y="85" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="112" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="565" y="130" text-anchor="middle" class="svg-muted" font-size="12">probe target</text>
<line x1="130" y1="105" x2="260" y2="43" stroke="#64748b"/><line x1="130" y1="125" x2="260" y2="187" stroke="#64748b"/><line x1="370" y1="43" x2="500" y2="105" stroke="#64748b"/><line x1="370" y1="187" x2="500" y2="125" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="180" y="62" class="svg-muted" font-size="12">link 1</text><text x="180" y="170" class="svg-muted" font-size="12">link 2</text>
<text x="440" y="190" class="svg-accent" font-size="12">ISP2 broken here</text>
</svg><p class="cap">The interface of link 2 is up, but the path behind ISP2 is broken. Only the probe notices.</p></div>

<h3>NAT on each link</h3>
<p>Each ISP gives a different public address. Outbound traffic leaving by ISP2 must be translated to the ISP2 address, not the ISP1 address, or the reply never returns. Use NAT to the interface address of the link in use, and verify in the NAT rules that both paths are covered. The exact way Multi-Link and NAT are tied depends on the release, so check the documentation for your NGFW version.</p>

<pre class="out">CONFIG Engines - Multi-Link status (illustrative layout)
mode: standby
  ISP1  eth1  gw 203.0.113.1  probe 192.0.2.53   <span class="hl">DEAD (probe failed)</span>
  ISP2  eth4  gw 192.0.2.1    probe 192.0.2.53   alive  <span class="hl">in use</span></pre>

<div class="eg"><p><b>Worked example.</b> Lab fp-vpn-3. Mode is standby with ISP1 first. The ISP1 router goes down, but the engine's eth1 stays up because the switch port is fine. Without a probe, ISP1 still counts as alive and STAFF-PC loses internet. Step 1: set the probe target on ISP1 and ISP2 to an address both can reach. Step 2: Install Policy on NK-PUNE-FW, because the snapshot on the engine is what the traffic uses. Step 3: break ISP1 again. The gateway device can no longer reach the probe target through ISP1, so ISP1 is marked not alive and traffic uses ISP2. Step 4: restore ISP1; it becomes alive again and, in standby, it takes over as the first alive link.</p></div>

<div class="warn"><p><b>Common mistakes.</b> No probe at all. A probe target that is itself unreliable or that only one provider can reach. Forgetting NAT for the second link. Editing the links in the SMC but not running Install Policy, so the engine still has the old snapshot.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Interface up" is not "link healthy". Failover for a broken provider needs a probe. Balance spreads traffic over all alive links; standby uses only the first alive link.</p></div>

<div class="scn"><h4>The silent ISP</h4><p>On a festival weekend a Pune ISP lost a regional router. The branch fibre was fine, so the engine showed the link up. For three hours the branch had no internet while the standby line sat idle. The next week the team added probes to both links. During the next outage, the engine withdrew the broken link within moments and users noticed nothing. Logs and Monitoring showed which link was used.</p><p><b>Lesson:</b> design for the failure you cannot see from your own cable.</p></div>

<div class="iv"><p class="q">"How does an NGFW decide that an internet link is dead?"</p><p>Strong answer: interface state alone only catches local failures. A probe to a target beyond the ISP, checked through that link, detects upstream faults. When the probe fails the link is withdrawn; when it recovers the link rejoins. Mention the standby and balance modes, and that NAT must match the link used.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multi-Link uses several ISP links on one engine for resilience and bandwidth.</li>
<li>Standby uses the first alive link; balance uses all alive links.</li>
<li>Alive means the interface is up and the probe target, if set, is reachable.</li>
<li>Without a probe a link behind a broken ISP stays in use.</li>
<li>Install Policy on the engine after any link change.</li>
</ul></div>
`,hi:`
<p>Ek internet line wala branch ek cable cut door hai offline hone se. <b>Multi-Link</b> engine ko alag providers ke do ya zyada internet connections use karne deta hai, taaki ek fail hone par branch bacha rahe. Is chapter mein aap outbound side seekhoge aur lab fp-vpn-3 ki taiyari karoge.</p>

<h3>Analogy: highway tak do raaste</h3>
<p>Aapke office se highway tak do raaste hain. Ek main road hai, doosra lamba back road. Main road band ho to drivers ko back road par switch karna padega. Lekin drivers ko kaun batayega ki road band hai? Agar koi nahi batata, to woh mari hui road par queue mein khade rehte hain. <b>Probe</b> woh traffic reporter hai jo sach mein road par gaadi chalakar report karta hai.</p>

<h3>Links, modes aur selection</h3>
<p>Model mein har <b>link</b> ka ek name, ek interface, ek gateway (ISP router) aur optional probe target hota hai. Pune ke liye: link ISP1 eth1 par gateway 203.0.113.1 ke saath, aur doosra circuit ISP2 kisi aur interface par apne gateway ke saath. Doosre circuit ki addressing examples mein illustrative hai; apni lab mein dikhayi gayi addressing use karo.</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th><th>Kab use karein</th></tr>
<tr><td><b>standby</b></td><td>Pehla alive link traffic uthata hai. Agla link tabhi use hota hai jab pehla alive nahi.</td><td>Sasta ya metered backup line</td></tr>
<tr><td><b>balance</b></td><td>Saare alive links traffic uthate hain; connections unke beech failte hain.</td><td>Do similar lines, dono ki bandwidth chahiye</td></tr>
</table>
<p>Standby mein order matter karta hai: preferred link pehle likho. Balance mein dead link spread se bahar ho jaata hai. Real products weights aur per-link priorities bhi dete hain; check the documentation for your NGFW version.</p>

<h3>Link alive kab hota hai?</h3>
<p>Model ek simple rule use karta hai jo yaad rakhna hai:</p>
<ul>
<li>Link alive hai jab uska <b>interface up</b> ho aur, agar <b>probe target</b> set hai, to gateway device us <b>probe target tak pahunch sake</b>.</li>
<li>Probe nahi ho to sirf interface check hota hai.</li>
</ul>
<p>Yahi key idea hai. Zyada tar ISP failures aapke darwaze par cable cut nahi hote. Cable theek hai, interface up rehta hai, lekin uske peeche ISP network toota hota hai. Probe ke bina engine maanta hai ki link healthy hai aur traffic ko khaali mein bhejta rehta hai. Users bolte hain "internet slow ya band hai" jabki doosri line khaali padi hai. ISP ke aage kisi reliable address par probe (jaise public address jise test karne ki permission ho, hamare example mein 192.0.2.53) hone se engine failure dekh leta hai aur link ko <b>withdraw</b> kar deta hai. Traffic agle alive link par chala jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Probes ke saath do links">
<rect x="10" y="85" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="70" y="130" text-anchor="middle" class="svg-muted" font-size="12">Multi-Link</text>
<rect x="260" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="315" y="48" text-anchor="middle" class="svg-ink" font-size="13">ISP1 router</text>
<rect x="260" y="164" width="110" height="46" rx="8" fill="#fed7aa"/><text x="315" y="192" text-anchor="middle" class="svg-ink" font-size="13">ISP2 router</text>
<rect x="500" y="85" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="112" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="565" y="130" text-anchor="middle" class="svg-muted" font-size="12">probe target</text>
<line x1="130" y1="105" x2="260" y2="43" stroke="#64748b"/><line x1="130" y1="125" x2="260" y2="187" stroke="#64748b"/><line x1="370" y1="43" x2="500" y2="105" stroke="#64748b"/><line x1="370" y1="187" x2="500" y2="125" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="180" y="62" class="svg-muted" font-size="12">link 1</text><text x="180" y="170" class="svg-muted" font-size="12">link 2</text>
<text x="440" y="190" class="svg-accent" font-size="12">ISP2 yahan toota hai</text>
</svg><p class="cap">Link 2 ka interface up hai, lekin ISP2 ke peeche ka path toota hai. Sirf probe ise notice karta hai.</p></div>

<h3>Har link par NAT</h3>
<p>Har ISP alag public address deta hai. ISP2 se nikalne wala outbound traffic ISP2 address mein translate hona chahiye, ISP1 address mein nahi, nahi to reply wapas nahi aata. Use link ke interface address par NAT karo, aur NAT rules mein verify karo ki dono paths cover hain. Multi-Link aur NAT kaise jude hain yeh release par depend karta hai, isliye check the documentation for your NGFW version.</p>

<pre class="out">CONFIG Engines - Multi-Link status (illustrative layout)
mode: standby
  ISP1  eth1  gw 203.0.113.1  probe 192.0.2.53   <span class="hl">DEAD (probe failed)</span>
  ISP2  eth4  gw 192.0.2.1    probe 192.0.2.53   alive  <span class="hl">in use</span></pre>

<div class="eg"><p><b>Worked example.</b> Lab fp-vpn-3. Mode standby hai, ISP1 pehle. ISP1 router down ho jaata hai, lekin engine ka eth1 up rehta hai kyunki switch port theek hai. Probe ke bina ISP1 abhi bhi alive gina jaata hai aur STAFF-PC ka internet chala jaata hai. Step 1: ISP1 aur ISP2 par probe target aisa address set karo jisse dono pahunch sakein. Step 2: NK-PUNE-FW par Install Policy karo, kyunki traffic engine ka snapshot use karta hai. Step 3: ISP1 dobara tod do. Gateway device ab ISP1 ke through probe target tak nahi pahunch sakta, isliye ISP1 not alive mark hota hai aur traffic ISP2 use karta hai. Step 4: ISP1 restore karo; woh phir alive ho jaata hai aur standby mein pehle alive link ke roop mein wapas le leta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Probe bilkul na rakhna. Aisa probe target jo khud unreliable ho ya jise sirf ek provider pahunch sake. Doosre link ke liye NAT bhool jaana. SMC mein links edit karna lekin Install Policy na chalana, jisse engine par purana snapshot rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Interface up" matlab "link healthy" nahi. Toote provider ke failover ke liye probe chahiye. Balance saare alive links par traffic failata hai; standby sirf pehla alive link use karta hai.</p></div>

<div class="scn"><h4>Khamosh ISP</h4><p>Festival weekend par Pune ke ek ISP ka regional router chala gaya. Branch ka fibre theek tha, isliye engine ne link up dikhaya. Teen ghante branch ke paas internet nahi tha jabki standby line khaali thi. Agle hafte team ne dono links par probes add kiye. Agli outage mein engine ne toote link ko kuch hi pal mein withdraw kar diya aur users ko pata bhi nahi chala. Logs aur Monitoring ne dikhaya kaun sa link use hua.</p><p><b>Lesson:</b> us failure ke liye design karo jo aapke apne cable se dikhayi nahi deta.</p></div>

<div class="iv"><p class="q">"NGFW kaise decide karta hai ki internet link dead hai?"</p><p>Strong answer: sirf interface state local failures pakadta hai. ISP ke aage ke target par us link ke through probe upstream faults detect karta hai. Probe fail ho to link withdraw hota hai; recover ho to link wapas judta hai. Standby aur balance modes batao, aur yeh ki NAT use hue link se match karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multi-Link ek engine par kai ISP links resilience aur bandwidth ke liye use karta hai.</li>
<li>Standby pehla alive link use karta hai; balance saare alive links.</li>
<li>Alive matlab interface up aur probe target, agar set hai, reachable.</li>
<li>Probe ke bina toote ISP ke peeche ka link use mein rehta hai.</li>
<li>Link change ke baad engine par Install Policy karo.</li>
</ul></div>
`}};export{e as default};