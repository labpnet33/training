var e={id:`withdraw-outbound-limits`,h:{en:`Withdraw static routes, outbound routes and license limits`,hi:`Withdraw static routes, outbound routes aur license limits`},body:{en:`
<p>A good road network does two things when a bridge collapses: it removes the road sign that points to the bridge, and it tells neighbouring towns which roads are still open. A service connection needs the same discipline. This chapter covers the advanced settings that control what Prisma Access announces and withdraws, plus the license limits you must plan for.</p>

<h3>Withdraw Static Routes when the tunnel is down</h3>
<p>If you use <b>static routes</b> on a service connection, Prisma Access does not learn that the far side has failed through BGP. It would keep pointing traffic at a dead tunnel. The advanced setting <b>Withdraw Static Routes</b> (in SCM; it is on by default) removes the static routes of that service connection when its tunnel is down, so traffic can move to another path, such as a second service connection. It relies on tunnel monitoring to know the tunnel is down.</p>
<ul>
<li>Use it when you have two service connections to the same HQ with static routes.</li>
<li>With BGP, a lost session withdraws routes by itself (after the hold timer), so the setting matters mainly for static designs.</li>
</ul>

<h3>Outbound routes</h3>
<p>The advanced settings also have <b>Outbound Routes</b>. They control which prefixes Prisma Access advertises toward the corporate side. The SCM page allows up to <b>500</b> prefixes. The Panorama Service Setup page we use as a source states a lower maximum of <b>10</b>. Because these documents differ, check the limit shown in your own console before you design a long list.</p>

<h3>Other route controls on a service connection</h3>
<table class="cmp"><tr><th>Control</th><th>What it does</th></tr>
<tr><td>Summarize Mobile User Routes</td><td>Announces one summary for mobile pools, not many /24 blocks</td></tr>
<tr><td>No-export community</td><td>Tags routes so they are not passed on (SCM: Enabled-In / Enabled-Out / Enabled-Both; Panorama: Enabled Out, off by default)</td></tr>
<tr><td>Don't Advertise Prisma Access Routes</td><td>HQ receives nothing from Prisma Access (rarely what you want)</td></tr>
<tr><td>MRAI timer</td><td>1 to 600 s, default 30</td></tr>
<tr><td>QoS Profile (SCM advanced)</td><td>Applies a QoS profile</td></tr>
<tr><td>eBGP TTL</td><td>8</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Withdraw static routes">
<rect x="20" y="30" width="240" height="150" rx="10" fill="#bbf7d0"/><text x="140" y="56" text-anchor="middle" class="svg-ink" font-size="14">Tunnel up</text><text x="140" y="84" text-anchor="middle" class="svg-muted" font-size="12">SC-A routes present</text><text x="140" y="106" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24 via SC-A</text><text x="140" y="128" text-anchor="middle" class="svg-muted" font-size="12">monitor 10.10.0.50 ok</text>
<rect x="380" y="30" width="240" height="150" rx="10" fill="#fed7aa"/><text x="500" y="56" text-anchor="middle" class="svg-ink" font-size="14">Tunnel down</text><text x="500" y="84" text-anchor="middle" class="svg-muted" font-size="12">monitor fails</text><text x="500" y="106" text-anchor="middle" class="svg-muted" font-size="12">static routes withdrawn</text><text x="500" y="128" text-anchor="middle" class="svg-muted" font-size="12">traffic moves to SC-B</text>
<line x1="260" y1="105" x2="380" y2="105" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">Withdraw Static Routes stops the cloud from sending traffic into a dead tunnel.</p></div>

<h3>Tunnel monitoring on a service connection</h3>
<p>The service connection form asks for a monitoring destination on the corporate network. In the lab it is the app server 10.10.0.50. Choose a host that is always up and that answers the probes. The CPE (HQ-FW) needs a route so that the probe replies come back through the tunnel. If the monitored host is down, Prisma Access may think the tunnel is down.</p>

<h3>License limits to remember</h3>
<ul>
<li>Base licences: up to <b>5</b> service connections.</li>
<li>With the Private Application add-on: up to <b>200</b> per tenant.</li>
<li>Mobile users: licensed by user count. The Local licence allows at most five combined locations; Worldwide has no restriction.</li>
<li>Remote network bandwidth is a separate pool (see pa-remote).</li>
<li>Scale (5.2 onward): 25,000 remote networks and 50,000 IKE gateways per tenant.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A company has SC-A (Mumbai) and SC-B (Singapore), both static. Withdraw Static Routes is on. A fibre cut takes down SC-A. Tunnel monitoring to 10.10.0.50 fails, SC-A's static routes are withdrawn, and the traffic to 10.10.0.0/24 follows SC-B. When SC-A recovers, its routes return.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Turning off Withdraw Static Routes in a two-tunnel design; monitoring a host that is sometimes powered off; hitting the 5 service connection limit during an expansion; listing too many outbound routes without checking the limit in the console.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the numbers: 5 base service connections, 200 with the Private Application add-on, MRAI 1 to 600, TTL 8, outbound routes limit (SCM 500; confirm the Panorama figure). Withdraw Static Routes is on by default in SCM.</p></div>

<div class="scn"><h4>Failover that did not fail over</h4><p>A company had two static service connections but the failover to the second did not happen when the first tunnel died. Withdraw Static Routes had been turned off during a test and never turned back on. Prisma Access kept sending traffic to the dead tunnel. Re-enabling it fixed the next failover.</p><p><b>Lesson:</b> static designs depend on withdrawing routes and on tunnel monitoring.</p></div>

<div class="iv"><p class="q">"What does Withdraw Static Routes do?"</p><p>When the service connection tunnel is down, Prisma Access withdraws that connection's static routes so traffic can use another path. It depends on tunnel monitoring and is on by default in SCM. With BGP, route loss is handled by the session itself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Withdraw Static Routes removes dead static paths; default on in SCM.</li>
<li>Outbound Routes control what Prisma Access announces to HQ; verify the limit in your console.</li>
<li>Summarize, no-export and MRAI refine BGP behaviour.</li>
<li>Limits: 5 base service connections, 200 with add-on.</li>
<li>Choose a reliable tunnel monitoring host.</li>
</ul></div>
`,hi:`
<p>Achha road network jab pul tootta hai to do kaam karta hai: pul ki taraf ishara karne wala sign hata deta hai, aur padosi shehron ko batata hai ki kaun si roads khuli hain. Service connection ko bhi yahi discipline chahiye. Yeh chapter woh advanced settings batata hai jo control karti hain ki Prisma Access kya announce aur withdraw karta hai, aur woh license limits jo aapko plan karni hain.</p>

<h3>Tunnel down ho to Withdraw Static Routes</h3>
<p>Service connection par <b>static routes</b> use karo to Prisma Access ko BGP se pata nahi chalta ki doosri side fail ho gayi. Woh traffic ko dead tunnel ki taraf point karta rahega. Advanced setting <b>Withdraw Static Routes</b> (SCM mein; default on hai) tunnel down hone par us service connection ke static routes hata deti hai, taaki traffic kisi aur path, jaise doosre service connection, par chala jaaye. Isko tunnel down ka pata chalne ke liye tunnel monitoring chahiye.</p>
<ul>
<li>Same HQ tak static routes ke saath do service connections hon to use karo.</li>
<li>BGP ke saath session lost hone par routes (hold timer ke baad) khud withdraw ho jaate hain, isliye setting zyadatar static designs ke liye matter karti hai.</li>
</ul>

<h3>Outbound routes</h3>
<p>Advanced settings mein <b>Outbound Routes</b> bhi hain. Yeh control karte hain ki Prisma Access corporate side ki taraf kaun se prefixes advertise kare. SCM page up to <b>500</b> prefixes allow karta hai. Hum jo Panorama Service Setup page source ki tarah use karte hain woh kam maximum <b>10</b> batata hai. Documents alag hain, isliye lambi list design karne se pehle apne console mein dikhne wali limit check karo.</p>

<h3>Service connection par aur route controls</h3>
<table class="cmp"><tr><th>Control</th><th>Kya karta hai</th></tr>
<tr><td>Summarize Mobile User Routes</td><td>Mobile pools ke liye kai /24 blocks ki jagah ek summary announce karta hai</td></tr>
<tr><td>No-export community</td><td>Routes ko tag karta hai taaki aage pass na hon (SCM: Enabled-In / Enabled-Out / Enabled-Both; Panorama: Enabled Out, default off)</td></tr>
<tr><td>Don't Advertise Prisma Access Routes</td><td>HQ ko Prisma Access se kuch nahi milta (shayad hi aap yeh chahoge)</td></tr>
<tr><td>MRAI timer</td><td>1 se 600 s, default 30</td></tr>
<tr><td>QoS Profile (SCM advanced)</td><td>QoS profile lagata hai</td></tr>
<tr><td>eBGP TTL</td><td>8</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Withdraw static routes">
<rect x="20" y="30" width="240" height="150" rx="10" fill="#bbf7d0"/><text x="140" y="56" text-anchor="middle" class="svg-ink" font-size="14">Tunnel up</text><text x="140" y="84" text-anchor="middle" class="svg-muted" font-size="12">SC-A routes maujood</text><text x="140" y="106" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24 via SC-A</text><text x="140" y="128" text-anchor="middle" class="svg-muted" font-size="12">monitor 10.10.0.50 ok</text>
<rect x="380" y="30" width="240" height="150" rx="10" fill="#fed7aa"/><text x="500" y="56" text-anchor="middle" class="svg-ink" font-size="14">Tunnel down</text><text x="500" y="84" text-anchor="middle" class="svg-muted" font-size="12">monitor fail</text><text x="500" y="106" text-anchor="middle" class="svg-muted" font-size="12">static routes withdrawn</text><text x="500" y="128" text-anchor="middle" class="svg-muted" font-size="12">traffic SC-B par</text>
<line x1="260" y1="105" x2="380" y2="105" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">Withdraw Static Routes cloud ko dead tunnel mein traffic bhejne se rokta hai.</p></div>

<h3>Service connection par tunnel monitoring</h3>
<p>Service connection form corporate network par monitoring destination maangta hai. Lab mein yeh app server 10.10.0.50 hai. Aisa host chuno jo hamesha up rehta ho aur probes ka jawab deta ho. CPE (HQ-FW) ko route chahiye taaki probe replies tunnel se wapas aayein. Monitored host down ho to Prisma Access tunnel ko down maan sakta hai.</p>

<h3>License limits yaad rakho</h3>
<ul>
<li>Base licences: up to <b>5</b> service connections.</li>
<li>Private Application add-on ke saath: per tenant up to <b>200</b>.</li>
<li>Mobile users: user count se licensed. Local licence mein maximum paanch combined locations; Worldwide mein koi restriction nahi.</li>
<li>Remote network bandwidth alag pool hai (pa-remote dekho).</li>
<li>Scale (5.2 se): per tenant 25,000 remote networks aur 50,000 IKE gateways.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Company ke paas SC-A (Mumbai) aur SC-B (Singapore) hain, dono static. Withdraw Static Routes on hai. Fibre cut se SC-A down. 10.10.0.50 ki tunnel monitoring fail hoti hai, SC-A ke static routes withdraw hote hain, aur 10.10.0.0/24 ka traffic SC-B se jaata hai. SC-A recover ho to uske routes wapas aate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Do-tunnel design mein Withdraw Static Routes off karna; aisa host monitor karna jo kabhi band hota hai; expansion ke dauran 5 service connection limit se takrana; console mein limit dekhe bina bahut saare outbound routes list karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Numbers yaad rakho: 5 base service connections, Private Application add-on ke saath 200, MRAI 1 se 600, TTL 8, outbound routes limit (SCM 500; Panorama figure confirm karo). Withdraw Static Routes SCM mein default on hai.</p></div>

<div class="scn"><h4>Failover jo fail over hua hi nahi</h4><p>Company ke paas do static service connections the par pehla tunnel mara to doosre par failover nahi hua. Test ke dauran Withdraw Static Routes off kiya gaya tha aur wapas on nahi hua. Prisma Access dead tunnel mein traffic bhejta raha. Re-enable karne se agla failover chal gaya.</p><p><b>Lesson:</b> static designs routes withdraw hone aur tunnel monitoring par depend karte hain.</p></div>

<div class="iv"><p class="q">"Withdraw Static Routes kya karta hai?"</p><p>Service connection tunnel down ho to Prisma Access us connection ke static routes withdraw kar deta hai taaki traffic kisi aur path se jaa sake. Yeh tunnel monitoring par depend karta hai aur SCM mein default on hai. BGP ke saath route loss session khud handle karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Withdraw Static Routes dead static paths hatata hai; SCM mein default on.</li>
<li>Outbound Routes control karte hain Prisma Access HQ ko kya announce kare; console mein limit verify karo.</li>
<li>Summarize, no-export aur MRAI BGP behaviour refine karte hain.</li>
<li>Limits: 5 base service connections, add-on ke saath 200.</li>
<li>Reliable tunnel monitoring host chuno.</li>
</ul></div>
`}};export{e as default};