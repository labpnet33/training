var e={id:`interface-state`,h:{en:`Reading interface state: Admin, Link and Proto`,hi:`Interface state padhna: Admin, Link aur Proto`},body:{en:`
<p>Almost every network problem starts at an interface. Before you look at routing, ask: is the interface even up? Junos answers this in one command, <code>show interfaces terse</code>. Learn to read it fast and you will find a third of all faults in the first thirty seconds.</p>

<h3>Physical and logical interfaces</h3>
<p>Junos separates the <b>physical interface</b> (the port, such as <code>ge-0/0/0</code>) from the <b>logical interface</b> or <b>unit</b> (such as <code>ge-0/0/0.0</code>). The IP address lives on the unit, under <code>family inet</code>. The name <code>ge-0/0/0</code> means: media type <code>ge</code> (Gigabit Ethernet), FPC 0, PIC 0, port 0. The loopback is <code>lo0</code> with unit <code>lo0.0</code>.</p>

<h3>The columns</h3>
<dl class="terms">
<dt>Admin</dt><dd>What the configuration says. <b>up</b> is the default; <b>down</b> means someone configured <code>disable</code> on it.</dd>
<dt>Link</dt><dd>What the hardware sees. <b>up</b> means a signal is present; <b>down</b> means no signal.</dd>
<dt>Proto</dt><dd>The address family on a logical unit, for example <code>inet</code> for IPv4 or <code>inet6</code>.</dd>
<dt>Local</dt><dd>The IP address and prefix length configured on the unit.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Decision tree for interface state">
<rect x="230" y="10" width="180" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Admin column?</text>
<rect x="30" y="80" width="190" height="44" rx="8" fill="#fed7aa"/><text x="125" y="100" text-anchor="middle" class="svg-ink" font-size="12">down: disable in config</text><text x="125" y="116" text-anchor="middle" class="svg-muted" font-size="12">delete ... disable</text>
<rect x="340" y="80" width="270" height="44" rx="8" fill="#bae6fd"/><text x="475" y="100" text-anchor="middle" class="svg-ink" font-size="12">up: look at Link column</text><text x="475" y="116" text-anchor="middle" class="svg-muted" font-size="12">link down = cable, optic, far end</text>
<rect x="340" y="140" width="270" height="44" rx="8" fill="#bbf7d0"/><text x="475" y="160" text-anchor="middle" class="svg-ink" font-size="12">link up = layer 1 fine</text><text x="475" y="176" text-anchor="middle" class="svg-muted" font-size="12">now check address and errors</text>
<line x1="290" y1="46" x2="160" y2="80" stroke="#64748b" stroke-width="2"/><line x1="350" y1="46" x2="460" y2="80" stroke="#64748b" stroke-width="2"/><line x1="475" y1="124" x2="475" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Read Admin first, then Link, then the address. Each answer points to a different fix.</p></div>

<h3>Worked example from the Jaipur lab</h3>
<p>On R2 (the core router) the engineer runs the command and sees:</p>
<pre class="out">lab@R2-CORE&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.0.12.2/30
<span class="hl">ge-0/0/1                down  down</span>
ge-0/0/1.0              up    down inet     10.0.23.1/30
lo0                     up    up
lo0.0                   up    up   inet     10.255.1.2/32
</pre>
<p>The physical port ge-0/0/1 is Admin down: someone typed <code>set interfaces ge-0/0/1 disable</code>. The unit shows Link down only as a consequence. The fix:</p>
<pre class="code">lab@R2-CORE&gt; configure
lab@R2-CORE# delete interfaces ge-0/0/1 disable
lab@R2-CORE# commit and-quit
lab@R2-CORE&gt; show ospf neighbor
<span class="c">! after about 40 seconds the neighbour 10.255.1.3 shows Full</span></pre>

<h3>The three common patterns</h3>
<table class="cmp"><tr><th>Admin</th><th>Link</th><th>Meaning</th><th>First action</th></tr>
<tr><td>down</td><td>down</td><td>Disabled by configuration</td><td>show configuration interfaces, delete disable</td></tr>
<tr><td>up</td><td>down</td><td>No signal: cable, optic, far end disabled, speed mismatch</td><td>Check the far end first, then the cable</td></tr>
<tr><td>up</td><td>up</td><td>Layer 1 fine, but the address may be wrong</td><td>Compare Local address with the neighbour</td></tr></table>

<h3>When Admin up and Link up still fails</h3>
<p>The second lab fault is exactly this. On R3 the server-facing port ge-0/0/2 is up and up, with address <code>10.30.3.1/24</code>, but the server SRV is <code>10.33.3.10/24</code> with gateway <code>10.33.3.1</code>. The link is fine; the subnet is wrong, so SRV cannot find its gateway.</p>
<pre class="out">lab@R3-DC&gt; show interfaces terse ge-0/0/2
Interface               Admin Link Proto    Local                 Remote
ge-0/0/2                up    up
ge-0/0/2.0              up    up   inet     <span class="hl">10.30.3.1/24</span>
</pre>
<p>Remember that <code>show interfaces terse ge-0/0/2</code> accepts an interface name to narrow output, and that <code>show interfaces descriptions</code> lists the labels people set with <code>description</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Reading only the logical unit line. A unit shows <code>Link down</code> when the physical port beneath it is down or disabled. Always read the physical line first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Admin is configuration, Link is signal. An interface with Admin up and Link down is not disabled; it has a physical or far-end problem. Also, <code>deactivate</code> and <code>disable</code> are not the same: a deactivated interface stanza is ignored, a disabled one is administratively down.</p></div>

<div class="scn"><h4>The one-digit typo</h4><p>After a cabling job, the file server stopped answering. Every light was green and the interface was up and up. The engineer compared the Local address on the router (10.30.3.1/24) with the server and its gateway (10.33.3.x). One digit had been mistyped during the change. She replaced the address, kept OSPF passive on the port, committed, and the server answered the next ping.</p><p><b>Lesson:</b> a link light proves layer 1 only. Check the address and subnet at layer 3.</p></div>

<div class="iv"><p class="q">"An interface shows Admin up and Link down. What do you check?"</p><p>That it is not a configuration issue, since Admin up means it is enabled. Then the physical path: cable seated, optic type and wavelength compatible, far-end interface not disabled, and speed/duplex settings consistent on both ends. Mention show interfaces extensive for light levels or error details and that you check the far end before replacing hardware.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show interfaces terse is the first command in any investigation.</li>
<li>Admin shows configuration; Link shows signal; the address sits on the logical unit.</li>
<li>Admin down plus Link down means disable is configured: delete interfaces name disable.</li>
<li>Admin up and Link up can still hide a wrong address or subnet.</li>
<li>Read the physical line before the unit line.</li>
</ul></div>
`,hi:`
<p>Lagbhag har network problem kisi interface se shuru hoti hai. Routing dekhne se pehle poocho: interface up bhi hai? Junos iska jawab ek command mein deta hai, <code>show interfaces terse</code>. Ise jaldi padhna seekh lo to aadhe se zyada faults pehle tees second mein mil jaate hain.</p>

<h3>Physical aur logical interfaces</h3>
<p>Junos <b>physical interface</b> (port, jaise <code>ge-0/0/0</code>) ko <b>logical interface</b> yaani <b>unit</b> (jaise <code>ge-0/0/0.0</code>) se alag rakhta hai. IP address unit par, <code>family inet</code> ke neeche rehta hai. Naam <code>ge-0/0/0</code> ka matlab: media type <code>ge</code> (Gigabit Ethernet), FPC 0, PIC 0, port 0. Loopback <code>lo0</code> hai aur uski unit <code>lo0.0</code>.</p>

<h3>Columns</h3>
<dl class="terms">
<dt>Admin</dt><dd>Configuration kya kehti hai. <b>up</b> default hai; <b>down</b> ka matlab kisi ne <code>disable</code> configure kiya hai.</dd>
<dt>Link</dt><dd>Hardware kya dekhta hai. <b>up</b> ka matlab signal hai; <b>down</b> ka matlab signal nahi.</dd>
<dt>Proto</dt><dd>Logical unit par address family, jaise IPv4 ke liye <code>inet</code> ya <code>inet6</code>.</dd>
<dt>Local</dt><dd>Unit par configured IP address aur prefix length.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Decision tree for interface state">
<rect x="230" y="10" width="180" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Admin column?</text>
<rect x="30" y="80" width="190" height="44" rx="8" fill="#fed7aa"/><text x="125" y="100" text-anchor="middle" class="svg-ink" font-size="12">down: config mein disable</text><text x="125" y="116" text-anchor="middle" class="svg-muted" font-size="12">delete ... disable</text>
<rect x="340" y="80" width="270" height="44" rx="8" fill="#bae6fd"/><text x="475" y="100" text-anchor="middle" class="svg-ink" font-size="12">up: Link column dekho</text><text x="475" y="116" text-anchor="middle" class="svg-muted" font-size="12">link down = cable, optic, far end</text>
<rect x="340" y="140" width="270" height="44" rx="8" fill="#bbf7d0"/><text x="475" y="160" text-anchor="middle" class="svg-ink" font-size="12">link up = layer 1 theek</text><text x="475" y="176" text-anchor="middle" class="svg-muted" font-size="12">ab address aur errors dekho</text>
<line x1="290" y1="46" x2="160" y2="80" stroke="#64748b" stroke-width="2"/><line x1="350" y1="46" x2="460" y2="80" stroke="#64748b" stroke-width="2"/><line x1="475" y1="124" x2="475" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehle Admin, phir Link, phir address padho. Har jawab alag fix ki taraf le jaata hai.</p></div>

<h3>Jaipur lab ka worked example</h3>
<p>R2 (core router) par engineer command chalata hai aur yeh dekhta hai:</p>
<pre class="out">lab@R2-CORE&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.0.12.2/30
<span class="hl">ge-0/0/1                down  down</span>
ge-0/0/1.0              up    down inet     10.0.23.1/30
lo0                     up    up
lo0.0                   up    up   inet     10.255.1.2/32
</pre>
<p>Physical port ge-0/0/1 Admin down hai: kisi ne <code>set interfaces ge-0/0/1 disable</code> type kiya. Unit ka Link down sirf uska nateeja hai. Fix:</p>
<pre class="code">lab@R2-CORE&gt; configure
lab@R2-CORE# delete interfaces ge-0/0/1 disable
lab@R2-CORE# commit and-quit
lab@R2-CORE&gt; show ospf neighbor
<span class="c">! lagbhag 40 second baad neighbour 10.255.1.3 Full dikhta hai</span></pre>

<h3>Teen common patterns</h3>
<table class="cmp"><tr><th>Admin</th><th>Link</th><th>Matlab</th><th>Pehla action</th></tr>
<tr><td>down</td><td>down</td><td>Configuration se disabled</td><td>show configuration interfaces, delete disable</td></tr>
<tr><td>up</td><td>down</td><td>Signal nahi: cable, optic, far end disabled, speed mismatch</td><td>Pehle far end, phir cable</td></tr>
<tr><td>up</td><td>up</td><td>Layer 1 theek, lekin address galat ho sakta hai</td><td>Local address ko neighbour se milao</td></tr></table>

<h3>Jab Admin up aur Link up ho phir bhi fail ho</h3>
<p>Lab ka doosra fault yahi hai. R3 par server-facing port ge-0/0/2 up aur up hai, address <code>10.30.3.1/24</code>, lekin server SRV <code>10.33.3.10/24</code> hai aur gateway <code>10.33.3.1</code>. Link theek hai; subnet galat hai, isliye SRV ko apna gateway nahi milta.</p>
<pre class="out">lab@R3-DC&gt; show interfaces terse ge-0/0/2
Interface               Admin Link Proto    Local                 Remote
ge-0/0/2                up    up
ge-0/0/2.0              up    up   inet     <span class="hl">10.30.3.1/24</span>
</pre>
<p>Yaad rakho <code>show interfaces terse ge-0/0/2</code> output ko ek interface tak seemit karne ke liye interface naam leta hai, aur <code>show interfaces descriptions</code> <code>description</code> se lagaye labels list karta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Sirf logical unit ki line padhna. Unit tab <code>Link down</code> dikhati hai jab neeche ka physical port down ya disabled ho. Hamesha pehle physical line padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Admin configuration hai, Link signal hai. Admin up aur Link down wala interface disabled nahi hai; usme physical ya far-end problem hai. Aur <code>deactivate</code> aur <code>disable</code> ek nahi hain: deactivated interface stanza ignore hota hai, disabled wala administratively down hota hai.</p></div>

<div class="scn"><h4>Ek digit ka typo</h4><p>Cabling job ke baad file server jawab dena band ho gaya. Saari lights green thi aur interface up aur up tha. Engineer ne router ka Local address (10.30.3.1/24) server aur uske gateway (10.33.3.x) se milaya. Change ke time ek digit galat type hua tha. Usne address badla, port par OSPF passive rakha, commit kiya, aur agle ping par server ne jawab diya.</p><p><b>Lesson:</b> link light sirf layer 1 saabit karti hai. Address aur subnet layer 3 par check karo.</p></div>

<div class="iv"><p class="q">"Interface Admin up aur Link down dikha raha hai. Kya check karoge?"</p><p>Pehle yeh ki configuration issue nahi hai, kyunki Admin up ka matlab enabled hai. Phir physical path: cable theek se laga hai, optic type aur wavelength compatible, far-end interface disabled nahi, aur dono ends par speed/duplex settings consistent. Batao ki show interfaces extensive se light levels ya error details dekhte ho aur hardware badalne se pehle far end check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show interfaces terse kisi bhi investigation ka pehla command hai.</li>
<li>Admin configuration dikhata hai; Link signal; address logical unit par hota hai.</li>
<li>Admin down aur Link down matlab disable configured hai: delete interfaces name disable.</li>
<li>Admin up aur Link up ke baad bhi galat address ya subnet chhupa ho sakta hai.</li>
<li>Unit line se pehle physical line padho.</li>
</ul></div>
`}};export{e as default};