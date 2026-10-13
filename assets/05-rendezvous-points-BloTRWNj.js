var e={id:`rendezvous-points`,h:{en:`Rendezvous points: static, bootstrap and Auto-RP`,hi:`Rendezvous points: static, bootstrap aur Auto-RP`},body:{en:`
<p>In sparse mode a last-hop router must know <b>where to send its (*,G) join</b>, and a first-hop router must know <b>where to register</b>. Both need the address of the <b>rendezvous point</b> for that group, and every router must agree on the same answer. If R1 thinks the RP is R2 while R3 thinks it is R4, the tree is built in two places that never meet. Choosing and distributing the RP is therefore the core design decision in PIM-SM.</p>

<h3>Four ways to learn the RP</h3>
<table class="cmp"><tr><th>Method</th><th>How</th><th>Type shown in show pim rps</th></tr>
<tr><td>Local</td><td>This router is the RP: <code>rp local address 10.61.255.2</code></td><td>local</td></tr>
<tr><td>Static</td><td>Typed on every other router: <code>rp static address 10.61.255.2</code></td><td>static</td></tr>
<tr><td>Bootstrap (BSR, RFC 5059)</td><td>Candidate RPs advertise themselves to an elected bootstrap router that floods the RP-set</td><td>bootstrap</td></tr>
<tr><td>Auto-RP (Cisco legacy)</td><td>Announcements on 224.0.1.39, mapping agent sends to 224.0.1.40</td><td>auto-rp</td></tr></table>
<p><b>Static</b> is simple, predictable and what you use in a small or stable network, but a change means editing every router. <b>BSR</b> is the standard dynamic protocol: the BSR is elected (highest priority, then highest address), candidate RPs unicast their group ranges and priorities to it, and the BSR floods the whole <b>RP-set</b> hop by hop in PIM messages. Every router runs the same hash function over the RP-set to choose an RP for a group, so they all agree. <b>Auto-RP</b> is a Cisco-proprietary method that needs dense-mode or sparse-dense for its own groups; Junos can take part in it for interoperability, but it is mostly theory on the exam.</p>

<h3>Configuring local and static RP in the lab</h3>
<p>In lab jmc-pimsm-snoop R2-CORE is the RP with its loopback 10.61.255.2, and R1 and R3 point to it statically.</p>
<pre class="code"><span class="c"># R2 (the RP)</span>
set protocols pim rp local address 10.61.255.2
<span class="c"># R1 and R3</span>
set protocols pim rp static address 10.61.255.2
<span class="c"># optional: this RP serves only the private range</span>
set protocols pim rp static address 10.61.255.2 group-ranges 239.0.0.0/8</pre>
<pre class="out">lab@R2&gt; show pim rps
RP address               Type        Mode   Holdtime Timeout Groups Group prefixes
10.61.255.2              <span class="hl">local</span>       sparse        0    None      1 224.0.0.0/4

lab@R3&gt; show pim rps
RP address               Type        Mode   Holdtime Timeout Groups Group prefixes
10.61.255.2              <span class="hl">static</span>      sparse        0    None      1 224.0.0.0/4</pre>
<p>On R2 the RP is learned from <b>local configuration</b>; on R3 it is <b>static</b>. The <code>Groups</code> column counts active groups using this RP, here 1 because 239.61.1.1 is in use. The group prefix is the whole multicast space 224.0.0.0/4 because no <code>group-ranges</code> was configured. With <code>show pim rps extensive</code> on the RP you also see the register state:</p>
<pre class="out">lab@R2&gt; show pim rps extensive
RP: 10.61.255.2
Learned via: local configuration (this router is the RP)
Mode: Sparse
Group Ranges:
        224.0.0.0/4
Active groups using RP:
        239.61.1.1
        total 1 groups active
Register State for RP:
Group           Source          FirstHop        RP Address      State       Timeout
239.61.1.1      10.61.10.50     10.61.10.1      10.61.255.2     Receive     0</pre>
<p>That Register State line is the proof that the first-hop router R1 (10.61.10.1) registered the source 10.61.10.50 to this RP.</p>

<h3>Bootstrap in practice</h3>
<pre class="code"><span class="c"># candidate BSR and candidate RP on R2 (configuration shown for study)</span>
set protocols pim rp bootstrap family inet priority 200
set protocols pim rp local address 10.61.255.2 priority 100 group-ranges 239.0.0.0/8
<span class="c"># every other router needs only PIM; it learns the RP-set from the BSR</span></pre>
<pre class="out">lab@R2&gt; show pim bootstrap
Instance: PIM.master
BSR                     Pri Local address           Pri State      Timeout
None                      0 10.61.255.2               0 InEligible        0
bsr-candidates: no bootstrap router elected</pre>
<p>This output was captured on the lab router while no BSR was configured: no router is eligible, so none is elected. After you configure a candidate BSR, the first line names the elected BSR and the state shows Elected on that router. Use <code>show pim bootstrap</code> to see the BSR election and <code>show pim rps</code> to see the type bootstrap.</p>
<p>Design notes: put the RP on a loopback that is advertised in the IGP, run PIM on that loopback, and avoid placing the RP on an access router. When several candidate RPs cover the same range, lower priority wins; equal priority is broken by the hash and then the highest address. For redundancy with static RP you need anycast (next chapter), because a static RP statement names one address.</p>

<div class="eg"><p><b>Worked example.</b> Two RPs: RP-A for 239.10.0.0/16 and RP-B for 239.20.0.0/16. Every router must know both with their group ranges. A join for 239.10.5.5 goes to RP-A, a join for 239.20.1.1 goes to RP-B. A group in neither range has no RP, so its joins stay local and no stream flows. This is the "no RP for group" trap: always cover every range you use.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using a physical interface address as the RP. If that link fails the RP disappears even though the router is alive. Use a loopback. Another mistake: configuring the RP statically on some routers and by BSR on others; the more specific group range or the static override then decides, which is confusing to debug.</p></div>
<div class="exam"><p><b>Exam trap.</b> The BSR does not choose the RP; it only distributes the RP-set. Each router chooses locally from the same set. The RP address must be reachable by unicast, and the router that owns it must run PIM on that interface.</p></div>

<div class="scn"><h4>Two routers, two ideas of the RP</h4><p>After a core upgrade, half the branch routers pointed at the old RP address and half at the new. Receivers in one branch joined one RP while the source registered with the other. <code>show pim rps</code> on a few routers revealed two different RP addresses for the same range. Aligning every router on the new loopback, and then moving to BSR so it could not happen again, restored the stream.</p><p><b>Lesson:</b> run <code>show pim rps</code> on every hop when a group is silent; the answers must match.</p></div>

<div class="iv"><p class="q">"Static RP versus BSR: which would you pick and why?"</p><p>For a small, stable network I choose static RP: it needs no extra protocol and is easy to troubleshoot. For larger or changing networks I choose BSR because candidate RPs and group ranges are learned automatically, with election giving a measure of redundancy. For true RP redundancy with a single RP address I would use anycast RP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every router must agree on the RP for each group; mismatches split the tree.</li>
<li>Local, static, BSR and Auto-RP are the four methods; show pim rps shows the type.</li>
<li>BSR distributes the RP-set; each router selects the RP with the same hash.</li>
<li>Use a loopback for the RP and run PIM on it.</li>
<li>show pim rps extensive on the RP proves the register arrived.</li>
</ul></div>
`,hi:`
<p>Sparse mode mein last-hop router ko pata hona chahiye ki <b>(*,G) join kahan bhejna hai</b>, aur first-hop router ko pata hona chahiye ki <b>kahan register karna hai</b>. Dono ko us group ke <b>rendezvous point</b> ka address chahiye, aur har router ka jawab same hona chahiye. Agar R1 sochta hai ki RP R2 hai aur R3 sochta hai ki R4, to tree do jagah banta hai jo kabhi milte nahi. Isliye RP chunna aur distribute karna PIM-SM ka core design decision hai.</p>

<h3>RP seekhne ke chaar tareeke</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise</th><th>show pim rps mein Type</th></tr>
<tr><td>Local</td><td>Yeh router hi RP hai: <code>rp local address 10.61.255.2</code></td><td>local</td></tr>
<tr><td>Static</td><td>Har doosre router par type karo: <code>rp static address 10.61.255.2</code></td><td>static</td></tr>
<tr><td>Bootstrap (BSR, RFC 5059)</td><td>Candidate RPs elected bootstrap router ko apna ad dete hain jo RP-set flood karta hai</td><td>bootstrap</td></tr>
<tr><td>Auto-RP (Cisco legacy)</td><td>224.0.1.39 par announcements, mapping agent 224.0.1.40 par bhejta hai</td><td>auto-rp</td></tr></table>
<p><b>Static</b> simple, predictable hai aur chhote ya stable network mein use hota hai, lekin change ka matlab har router edit karna. <b>BSR</b> standard dynamic protocol hai: BSR elect hota hai (highest priority, phir highest address), candidate RPs apni group ranges aur priorities use unicast karte hain, aur BSR poora <b>RP-set</b> PIM messages mein hop by hop flood karta hai. Har router RP-set par wahi hash function chalakar group ke liye RP chunta hai, isliye sab agree karte hain. <b>Auto-RP</b> Cisco-proprietary method hai jise apne groups ke liye dense-mode ya sparse-dense chahiye; Junos interoperability ke liye isme shamil ho sakta hai, lekin exam mein zyadatar theory hai.</p>

<h3>Lab mein local aur static RP configure karna</h3>
<p>Lab jmc-pimsm-snoop mein R2-CORE apne loopback 10.61.255.2 ke saath RP hai, aur R1 aur R3 use static point karte hain.</p>
<pre class="code"><span class="c"># R2 (RP)</span>
set protocols pim rp local address 10.61.255.2
<span class="c"># R1 aur R3</span>
set protocols pim rp static address 10.61.255.2
<span class="c"># optional: yeh RP sirf private range serve karta hai</span>
set protocols pim rp static address 10.61.255.2 group-ranges 239.0.0.0/8</pre>
<pre class="out">lab@R2&gt; show pim rps
RP address               Type        Mode   Holdtime Timeout Groups Group prefixes
10.61.255.2              <span class="hl">local</span>       sparse        0    None      1 224.0.0.0/4

lab@R3&gt; show pim rps
RP address               Type        Mode   Holdtime Timeout Groups Group prefixes
10.61.255.2              <span class="hl">static</span>      sparse        0    None      1 224.0.0.0/4</pre>
<p>R2 par RP <b>local configuration</b> se seekha gaya hai; R3 par woh <b>static</b> hai. <code>Groups</code> column is RP ko use karne wale active groups ginta hai, yahan 1 kyunki 239.61.1.1 use mein hai. Group prefix poora multicast space 224.0.0.0/4 hai kyunki koi <code>group-ranges</code> configure nahi kiya. RP par <code>show pim rps extensive</code> se register state bhi dikhta hai:</p>
<pre class="out">lab@R2&gt; show pim rps extensive
RP: 10.61.255.2
Learned via: local configuration (this router is the RP)
Mode: Sparse
Group Ranges:
        224.0.0.0/4
Active groups using RP:
        239.61.1.1
        total 1 groups active
Register State for RP:
Group           Source          FirstHop        RP Address      State       Timeout
239.61.1.1      10.61.10.50     10.61.10.1      10.61.255.2     Receive     0</pre>
<p>Register State ki yeh line saboot hai ki first-hop router R1 (10.61.10.1) ne source 10.61.10.50 ko is RP ke paas register kiya.</p>

<h3>Bootstrap practice mein</h3>
<pre class="code"><span class="c"># R2 par candidate BSR aur candidate RP (configuration padhai ke liye)</span>
set protocols pim rp bootstrap family inet priority 200
set protocols pim rp local address 10.61.255.2 priority 100 group-ranges 239.0.0.0/8
<span class="c"># baaki har router ko sirf PIM chahiye; woh BSR se RP-set seekhta hai</span></pre>
<pre class="out">lab@R2&gt; show pim bootstrap
Instance: PIM.master
BSR                     Pri Local address           Pri State      Timeout
None                      0 10.61.255.2               0 InEligible        0
bsr-candidates: no bootstrap router elected</pre>
<p>Yeh output lab router par tab capture hua jab koi BSR configure nahi tha: koi router eligible nahi, isliye koi elect nahi hua. Candidate BSR configure karne ke baad pehli line elected BSR ka naam batati hai aur us router par state Elected dikhta hai. BSR election dekhne ke liye <code>show pim bootstrap</code> aur type bootstrap dekhne ke liye <code>show pim rps</code> use karo.</p>
<p>Design notes: RP ko loopback par rakho jo IGP mein advertise ho, us loopback par PIM chalao, aur RP ko access router par mat rakho. Jab kai candidate RPs same range cover karte hain, kam priority jeetti hai; equal priority hash aur phir highest address se tie-break hoti hai. Static RP ke saath redundancy ke liye anycast (agla chapter) chahiye, kyunki static RP statement ek address ka naam leta hai.</p>

<div class="eg"><p><b>Worked example.</b> Do RPs: 239.10.0.0/16 ke liye RP-A aur 239.20.0.0/16 ke liye RP-B. Har router ko dono group ranges ke saath pata hone chahiye. 239.10.5.5 ka join RP-A ko jaata hai, 239.20.1.1 ka RP-B ko. Jis group ki range kisi mein nahi uska koi RP nahi, isliye uske joins local rehte hain aur stream nahi bahti. Yeh "no RP for group" trap hai: jo ranges use karte ho sabko cover karo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Physical interface address ko RP banana. Woh link fail ho to router zinda hone par bhi RP gayab ho jaata hai. Loopback use karo. Ek aur galti: kuch routers par RP static aur kuch par BSR se configure karna; phir zyada specific group range ya static override decide karta hai, jo debug mein confusing hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> BSR RP nahi chunta; woh sirf RP-set distribute karta hai. Har router usi set mein se locally chunta hai. RP address unicast se reachable hona chahiye, aur jis router ke paas woh hai usse us interface par PIM chalana chahiye.</p></div>

<div class="scn"><h4>Do routers, RP ke do khayal</h4><p>Core upgrade ke baad aadhe branch routers purane RP address ki taraf the aur aadhe naye ki taraf. Ek branch ke receivers ne ek RP ko join kiya jabki source ne doosre ke paas register kiya. Kuch routers par <code>show pim rps</code> ne ek hi range ke liye do alag RP addresses dikhaye. Har router ko naye loopback par align karne aur phir BSR par jaane se, taaki dobara na ho, stream wapas aayi.</p><p><b>Lesson:</b> group chup ho to har hop par <code>show pim rps</code> chalao; jawab match hone chahiye.</p></div>

<div class="iv"><p class="q">"Static RP versus BSR: kaunsa chunoge aur kyun?"</p><p>Chhote stable network ke liye static RP: koi extra protocol nahi aur troubleshoot karna aasan. Bade ya badalte network ke liye BSR, kyunki candidate RPs aur group ranges apne aap seekhe jaate hain, election se kuch redundancy milti hai. Ek RP address ke saath asli RP redundancy ke liye anycast RP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har router ko har group ke RP par agree karna chahiye; mismatch tree ko baant deta hai.</li>
<li>Local, static, BSR aur Auto-RP chaar methods hain; show pim rps type dikhata hai.</li>
<li>BSR RP-set distribute karta hai; har router wahi hash use karke RP chunta hai.</li>
<li>RP ke liye loopback use karo aur us par PIM chalao.</li>
<li>RP par show pim rps extensive saabit karta hai ki register aaya.</li>
</ul></div>
`}};export{e as default};