var e={id:`tunnel-config`,h:{en:`Configuring TE tunnels: path-options, explicit paths and make-before-break`,hi:`TE tunnels configure karna: path-options, explicit paths aur make-before-break`},body:{en:`
<p>A TE tunnel is configured only at the <b>head end</b>, like a travel agent writing an itinerary with a preferred route and a fallback. The agent says: first try this exact route (explicit), if that is not possible let the system find one (dynamic). The routers along the way follow the signalled path without any tunnel configuration of their own.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Path-options are tried in order of preference number; the lowest working option wins."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Tunnel1</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">head end PE1</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">path-option 1</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">explicit via P3, P4</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">path-option 2</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">dynamic by CSPF</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">tail end</text></svg><p class="cap">Path-options are tried in order of preference number; the lowest working option wins.</p></div>
<div class="note"><p>All configuration here is <b>Reference configuration (not run in the simulator)</b>. Addresses use documentation and private ranges.</p></div>
<h3>IOS XE tunnel with explicit and dynamic path-options</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
ip explicit-path name VIA-P3-P4 enable
 next-address 192.0.2.13
 next-address 192.0.2.14
 next-address 192.0.2.2
<span class="c">!</span>
interface Tunnel1
 description TE to PE2
 ip unnumbered Loopback0
 tunnel mode mpls traffic-eng
 tunnel destination 192.0.2.2
 tunnel mpls traffic-eng bandwidth 2000000
 tunnel mpls traffic-eng priority 3 3
 tunnel mpls traffic-eng path-option 1 explicit name VIA-P3-P4
 tunnel mpls traffic-eng path-option 2 dynamic
 tunnel mpls traffic-eng affinity 0x1 mask 0x1</pre>
<p>Reading the block: <code>tunnel mode mpls traffic-eng</code> makes it a TE tunnel. <code>tunnel destination</code> is the tail-end TE router ID. <code>tunnel mpls traffic-eng bandwidth</code> is in kbps (2 000 000 kbps is 2 Gbps). <code>priority 3 3</code> sets setup and hold priority. <code>path-option 1 explicit</code> uses the hop list; <code>path-option 2 dynamic</code> lets CSPF choose. The <code>affinity</code> and <code>mask</code> pair says: links with bit 0 set are required (mask selects the bits that matter, affinity gives the value).</p>
<h3>IOS XR equivalent</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
explicit-path name VIA-P3-P4
 index 10 next-address strict ipv4 unicast 192.0.2.13
 index 20 next-address strict ipv4 unicast 192.0.2.14
 index 30 next-address strict ipv4 unicast 192.0.2.2
<span class="c">!</span>
interface tunnel-te1
 description TE to PE2
 ipv4 unnumbered Loopback0
 destination 192.0.2.2
 signalled-bandwidth 2000000
 priority 3 3
 affinity include RED
 path-option 1 explicit name VIA-P3-P4
 path-option 2 dynamic</pre>
<p>On IOS XR the tunnel is <code>interface tunnel-te</code>, the destination and bandwidth are plain keywords, and the explicit path is a named list with indexes and a <b>strict</b> or <b>loose</b> flag.</p>
<h3>Strict versus loose hops</h3>
<ul>
<li><b>Strict</b> means the next hop must be directly connected. Use it when you want an exact path.</li>
<li><b>Loose</b> means the next hop may be reached through any path; the IGP decides how. Use it to say "pass through P3 somewhere", and CSPF fills in the rest.</li>
<li><b>Exclude-address</b> (<code>exclude-address</code> in IOS XE, <code>exclude</code> in XR) tells CSPF to avoid a node or link. Handy for "everything except this link" without describing the whole path.</li>
</ul>
<h3>Path-option order and re-optimisation</h3>
<p>Path-options are tried by <b>number</b>, lowest first. If option 1 fails, the head end tries option 2. When a better path becomes available, the head end can <b>re-optimise</b> and move the tunnel. It does this with <b>make-before-break</b>: a second LSP with the same SESSION but a new LSP ID is signalled over the new path, and RSVP shared-explicit reservation style lets both LSPs share the bandwidth instead of double-counting it. When the new one is up, traffic moves and the old one is torn down, so the switch is hitless. Re-optimisation triggers are a timer (default one hour on IOS XE), a manual <code>mpls traffic-eng reoptimize</code>, or an event such as a link becoming available.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
mpls traffic-eng reoptimize timers frequency 3600
<span class="c">! Lock down a tunnel so it never moves</span>
interface Tunnel1
 tunnel mpls traffic-eng path-option 1 explicit name VIA-P3-P4 lockdown</pre>
<div class="eg"><p><b>Worked example.</b> Tunnel1 prefers explicit path VIA-P3-P4 (option 1) and falls back to dynamic (option 2). During a fibre cut on P3-P4, option 1 fails and the tunnel moves to option 2 via the lower path. After the repair, at the next re-optimisation, the head end sees that option 1 is available again, signals a new LSP over it, and then switches without dropping a packet. If you set lockdown on option 1, the tunnel would never move away from a working path.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using <code>tunnel destination</code> with an interface address instead of the tail-end TE router ID. CSPF looks up the TED by router ID and finds nothing. Another mistake is giving bandwidth in the wrong unit: kbps on XE and XR, not Mbps. A third: an explicit path that lists loopbacks when you used strict next-address with link addresses (or the reverse). Be consistent.</p></div>
<div class="exam"><p><b>Exam trap.</b> The tunnel interface exists only at the head end. Tail end and transit routers need MPLS-TE and RSVP, but no tunnel interface. "Path-option 1" is not "priority 1": the first is the order of preference of paths, the second is the setup and hold priority for pre-emption.</p></div>
<div class="scn"><h4>Two options, one surprise</h4><p>A tunnel was configured with an explicit path-option 1 and a dynamic option 2. After a link repair the tunnel stayed on the dynamic path for days, adding latency. The engineer found re-optimisation timers disabled in the standard template. Enabling the one-hour re-optimisation brought the tunnel back to the preferred path without packet loss, thanks to make-before-break.</p><p><b>Lesson:</b> a fallback path-option is useful only if you also plan how traffic returns to the preferred option.</p></div>
<div class="iv"><p class="q">"How do you configure a TE tunnel with a primary explicit path and a dynamic fallback?"</p><p>On the head end create a tunnel interface in MPLS-TE mode with the destination router ID and requested bandwidth, then configure path-option 1 explicit with the named hop list and path-option 2 dynamic. Mention setup and hold priorities, optional affinity, and that re-optimisation uses make-before-break so moves are hitless.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configure the tunnel only at the head end; transit routers need only MPLS-TE and RSVP.</li>
<li>Path-options are tried by number; explicit gives control, dynamic lets CSPF decide.</li>
<li>Strict hops must be adjacent; loose hops may cross other routers.</li>
<li>Re-optimisation uses make-before-break with shared-explicit reservations.</li>
<li>Bandwidth is in kbps; destination is the tail-end TE router ID.</li>
</ul></div>
`,hi:`
<p>TE tunnel sirf <b>head end</b> par configure hota hai, jaise travel agent preferred route aur fallback ke saath itinerary likhta hai. Agent kehta hai: pehle yeh exact route try karo (explicit), woh na ho sake to system ko ek dhoondne do (dynamic). Raaste ke routers signalled path follow karte hain, bina apni tunnel configuration ke.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Path-options preference number ke order mein try hote hain; sabse chhota working option jeetta hai."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Tunnel1</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">head end PE1</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">path-option 1</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">explicit P3, P4 se</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">path-option 2</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">CSPF se dynamic</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">tail end</text></svg><p class="cap">Path-options preference number ke order mein try hote hain; sabse chhota working option jeetta hai.</p></div>
<div class="note"><p>Yahan ki saari configuration <b>Reference configuration (simulator mein run nahi hoti)</b> hai. Addresses documentation aur private ranges ke hain.</p></div>
<h3>Explicit aur dynamic path-options ke saath IOS XE tunnel</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
ip explicit-path name VIA-P3-P4 enable
 next-address 192.0.2.13
 next-address 192.0.2.14
 next-address 192.0.2.2
<span class="c">!</span>
interface Tunnel1
 description TE to PE2
 ip unnumbered Loopback0
 tunnel mode mpls traffic-eng
 tunnel destination 192.0.2.2
 tunnel mpls traffic-eng bandwidth 2000000
 tunnel mpls traffic-eng priority 3 3
 tunnel mpls traffic-eng path-option 1 explicit name VIA-P3-P4
 tunnel mpls traffic-eng path-option 2 dynamic
 tunnel mpls traffic-eng affinity 0x1 mask 0x1</pre>
<p>Block ko padhna: <code>tunnel mode mpls traffic-eng</code> ise TE tunnel banata hai. <code>tunnel destination</code> tail-end ka TE router ID hai. <code>tunnel mpls traffic-eng bandwidth</code> kbps mein hai (2 000 000 kbps = 2 Gbps). <code>priority 3 3</code> setup aur hold priority set karta hai. <code>path-option 1 explicit</code> hop list use karta hai; <code>path-option 2 dynamic</code> CSPF ko chunne deta hai. <code>affinity</code> aur <code>mask</code> ki jodi kehti hai: bit 0 set wale links required hain (mask batata hai kaunse bits matter karte hain, affinity value deti hai).</p>
<h3>IOS XR equivalent</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
explicit-path name VIA-P3-P4
 index 10 next-address strict ipv4 unicast 192.0.2.13
 index 20 next-address strict ipv4 unicast 192.0.2.14
 index 30 next-address strict ipv4 unicast 192.0.2.2
<span class="c">!</span>
interface tunnel-te1
 description TE to PE2
 ipv4 unnumbered Loopback0
 destination 192.0.2.2
 signalled-bandwidth 2000000
 priority 3 3
 affinity include RED
 path-option 1 explicit name VIA-P3-P4
 path-option 2 dynamic</pre>
<p>IOS XR par tunnel <code>interface tunnel-te</code> hai, destination aur bandwidth seedhe keywords hain, aur explicit path indexes aur <b>strict</b> ya <b>loose</b> flag wali named list hai.</p>
<h3>Strict versus loose hops</h3>
<ul>
<li><b>Strict</b> matlab next hop directly connected hona chahiye. Exact path chahiye to use karo.</li>
<li><b>Loose</b> matlab next hop kisi bhi path se pahuncha ja sakta hai; kaise, yeh IGP decide karta hai. "Kahin P3 se guzro" kehne ke liye use karo, baaki CSPF bharta hai.</li>
<li><b>Exclude-address</b> (IOS XE mein <code>exclude-address</code>, XR mein <code>exclude</code>) CSPF ko node ya link avoid karne ko kehta hai. "Is link ke alawa sab kuch" ke liye bina poora path likhe kaam aata hai.</li>
</ul>
<h3>Path-option order aur re-optimisation</h3>
<p>Path-options <b>number</b> se try hote hain, sabse chhota pehle. Option 1 fail ho to head end option 2 try karta hai. Behtar path available hone par head end <b>re-optimise</b> karke tunnel move kar sakta hai. Yeh <b>make-before-break</b> se hota hai: wahi SESSION lekin naye LSP ID wala doosra LSP naye path par signal hota hai, aur RSVP shared-explicit reservation style dono LSPs ko bandwidth double-count kiye bina share karne deta hai. Naya up hone par traffic move hota hai aur purana tear down hota hai, isliye switch hitless hai. Re-optimisation triggers: timer (IOS XE par default ek ghanta), manual <code>mpls traffic-eng reoptimize</code>, ya koi event jaise link ka available hona.</p>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
mpls traffic-eng reoptimize timers frequency 3600
<span class="c">! Tunnel ko lock karo taaki kabhi move na kare</span>
interface Tunnel1
 tunnel mpls traffic-eng path-option 1 explicit name VIA-P3-P4 lockdown</pre>
<div class="eg"><p><b>Worked example.</b> Tunnel1 explicit path VIA-P3-P4 (option 1) prefer karta hai aur dynamic (option 2) par fallback karta hai. P3-P4 par fibre cut mein option 1 fail hota hai aur tunnel neeche wale path se option 2 par chala jaata hai. Repair ke baad, agle re-optimisation par head end dekhta hai ki option 1 phir available hai, us par naya LSP signal karta hai, aur ek packet gira bina switch karta hai. Option 1 par lockdown lagaya hota to tunnel working path se kabhi nahi hilta.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>tunnel destination</code> mein tail-end TE router ID ki jagah interface address dena. CSPF TED ko router ID se dekhta hai aur kuch nahi paata. Ek aur galti bandwidth ki galat unit dena: XE aur XR par kbps, Mbps nahi. Teesri: explicit path jisme loopbacks hain jabki aapne strict next-address link addresses ke saath use kiya (ya ulta). Consistent raho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnel interface sirf head end par hota hai. Tail end aur transit routers ko MPLS-TE aur RSVP chahiye, tunnel interface nahi. "Path-option 1" aur "priority 1" alag hain: pehla paths ki preference ka order hai, doosra pre-emption ke liye setup aur hold priority hai.</p></div>
<div class="scn"><h4>Do options, ek surprise</h4><p>Tunnel explicit path-option 1 aur dynamic option 2 ke saath configured tha. Link repair ke baad tunnel dino tak dynamic path par raha, latency badhti rahi. Engineer ko standard template mein re-optimisation timers disabled mile. Ek ghante ki re-optimisation enable karne se make-before-break ki wajah se tunnel bina packet loss ke preferred path par wapas aa gaya.</p><p><b>Lesson:</b> fallback path-option tabhi kaam ki hai jab aap yeh bhi plan karo ki traffic preferred option par wapas kaise aayega.</p></div>
<div class="iv"><p class="q">"Primary explicit path aur dynamic fallback ke saath TE tunnel kaise configure karoge?"</p><p>Head end par destination router ID aur requested bandwidth ke saath MPLS-TE mode mein tunnel interface banao, phir named hop list ke saath path-option 1 explicit aur path-option 2 dynamic configure karo. Setup aur hold priorities, optional affinity batao, aur yeh ki re-optimisation make-before-break use karta hai isliye moves hitless hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel sirf head end par configure karo; transit routers ko sirf MPLS-TE aur RSVP chahiye.</li>
<li>Path-options number se try hote hain; explicit control deta hai, dynamic CSPF ko decide karne deta hai.</li>
<li>Strict hops adjacent hone chahiye; loose hops doosre routers cross kar sakte hain.</li>
<li>Re-optimisation shared-explicit reservations ke saath make-before-break use karta hai.</li>
<li>Bandwidth kbps mein hai; destination tail-end TE router ID hai.</li>
</ul></div>
`}};export{e as default};