var e={id:`lacp`,h:{en:`LACP: negotiating, verifying and protecting the bundle`,hi:`LACP: bundle ko negotiate, verify aur protect karna`},body:{en:`
<p>In chapter 2 you built ae0 with <code>lacp active</code> without asking what that means. LACP is a short conversation between two switches before they trust a bundle. It is the difference between "I think we are connected by two cables" and "we both agree these two cables form one link".</p>

<h3>Static LAG versus LACP</h3>
<p>A <b>static</b> LAG has no negotiation. Each side simply assumes the other is configured correctly. If a cable is plugged into the wrong port, or one side is not bundled, nobody notices and a loop or a black hole can follow. <b>LACP</b> (Link Aggregation Control Protocol, IEEE 802.3ad, now 802.1AX) sends small control frames, LACPDUs, over every member. A member joins the bundle only when the partner confirms it is part of the same bundle. LACP also removes a member whose partner stops talking, even when the physical link still shows Up. This is why you should prefer LACP.</p>

<h3>Active and passive</h3>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td><code>lacp active</code></td><td>Sends LACPDUs by itself</td></tr>
<tr><td><code>lacp passive</code></td><td>Only answers when it receives LACPDUs</td></tr></table>
<p>Combinations: active + active works; active + passive works; <b>passive + passive never works</b>, because neither side speaks first. Best practice: active on at least one side, usually both.</p>
<p><b>Timers.</b> The default is slow: one LACPDU every 30 seconds, and a member is declared dead after about 90 seconds of silence. <code>set interfaces ae0 aggregated-ether-options lacp periodic fast</code> sends one every second (dead after about 3 seconds). Fast timers detect a one-way failure sooner but use slightly more CPU.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="LACP negotiation">
<rect x="40" y="30" width="120" height="120" rx="10" fill="#bbf7d0"/><text x="100" y="95" text-anchor="middle" class="svg-ink" font-size="14">DS1</text>
<rect x="480" y="30" width="120" height="120" rx="10" fill="#bbf7d0"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="14">AS1</text>
<line x1="160" y1="60" x2="480" y2="60" stroke="#7c3aed" stroke-width="2"/><text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">LACPDU: I am system A, key 1, port 1</text>
<line x1="480" y1="100" x2="160" y2="100" stroke="#7c3aed" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">LACPDU: I am system B, key 1, port 1</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Both agree, so the member moves to Collecting + Distributing</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Each member link runs its own exchange</text>
</svg><p class="cap">Every member exchanges LACPDUs. Only agreed members forward user traffic.</p></div>

<h3>Reading show lacp interfaces</h3>
<p>This is the most important LACP command. Real output of the healthy Nashik bundle:</p>
<pre class="out">lab@DS1&gt; show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/10      Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/10    Partner    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/11      Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/11    Partner    No    No   Yes  Yes  Yes   Yes     Slow    Active
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/10                  Current   Slow periodic  <span class="hl">Collecting distributing</span>
      ge-0/0/11                  Current   Slow periodic  <span class="hl">Collecting distributing</span></pre>
<ul>
<li><b>Actor</b> is this switch, <b>Partner</b> is the far switch as this switch sees it.</li>
<li><b>Dist</b> (distributing), <b>Col</b> (collecting) and <b>Syn</b> (synchronised) all <b>Yes</b> mean the member is fully in the bundle.</li>
<li><b>Def</b> (defaulted) <b>Yes</b> means no LACPDU has ever arrived from the partner.</li>
<li>The protocol table: Receive State <b>Current</b> means the partner is talking; <b>Defaulted</b> means it is not. Mux State <b>Collecting distributing</b> is the target; <b>Detached</b> or <b>Waiting</b> means the member is not forwarding.</li>
</ul>
<p>Count LACPDUs with <code>show lacp statistics interfaces ae0</code>:</p>
<pre class="out">lab@DS1&gt; show lacp statistics interfaces ae0
Aggregated interface: ae0
    LACP Statistics:       LACP Rx     LACP Tx   Unknown Rx   Illegal Rx
      ge-0/0/10                   1           1            0            0
      ge-0/0/11                   1           1            0            0</pre>
<p>Rx rising on both members proves the partner is talking. Unknown or Illegal counters rising point to a misconfigured partner.</p>

<h3>When both sides are passive</h3>
<p>Here is the same bundle with <code>lacp passive</code> on both ends and no one speaking:</p>
<pre class="out">lab@SWA&gt; show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/4       Actor    No    No    No   No   No   Yes     Slow   Passive
      ge-0/0/4     Partner    No   <span class="hl">Yes</span>    No   No   No    No     Slow   Passive
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                 <span class="hl">Defaulted</span>     No periodic                 <span class="hl">Detached</span></pre>
<p>Partner Defaulted = Yes, Receive Defaulted, Transmit No periodic, Mux Detached: nothing is exchanged. Make one side active.</p>

<h3>minimum-links: when half a bundle is worse than none</h3>
<p>Suppose a bundle carries 8 Gbps of traffic over four 10G members and three fail. The remaining member cannot carry the load; users see congestion and loss while the link still looks "up". <code>minimum-links N</code> takes the entire ae interface down when fewer than N members are active, so routing or spanning tree can move traffic to another path. In our lab <code>minimum-links 2</code> with two members means: if either member fails, the whole bundle drops. Use it on bundles where a partial bundle would be harmful and an alternative path exists.</p>

<h3>The speed rule</h3>
<p>Members of one bundle must run at the same speed. A member forced to a different speed stays out; LACP then shows its Mux State as <b>Waiting</b> while the others are <b>Collecting distributing</b>. You will see exactly this in the troubleshooting lab.</p>

<div class="eg"><p><b>Worked example.</b> DS1 shows ge-0/0/10 as Collecting distributing but ge-0/0/11 as Waiting, Partner Syn = Yes but Actor Syn = No. The configuration shows <code>ether-options speed 100m</code> on ge-0/0/11. After you remove the speed statement, both members aggregate and the bundle reports 2Gbps.</p></div>

<div class="warn"><p><b>Common mistake.</b> Looking only at <code>show interfaces terse</code>. The member ports are "up" even when LACP has detached them. Always check <code>show lacp interfaces</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Passive + passive does not form a bundle. A static LAG (no LACP statement) forms with no negotiation and with no protection against miscabling.</p></div>

<div class="scn"><h4>The silent member</h4><p>A bank's data-centre bundle had four members. One transceiver developed a fault in one direction only: the switch could transmit but not receive. The port stayed up, but without LACPDUs coming back, LACP removed the member from the bundle in 90 seconds. With periodic fast the same detection would have been 3 seconds. The team changed the timers on critical bundles.</p><p><b>Lesson:</b> LACP catches faults that link state alone cannot.</p></div>

<div class="iv"><p class="q">"What is the difference between a static LAG and LACP, and which would you use?"</p><p>A static LAG forms without any negotiation and cannot detect miscabling or a silent partner. LACP exchanges LACPDUs so only agreed members forward traffic and failed members are removed. I use LACP with active on both sides, sometimes periodic fast, and I verify with <code>show lacp interfaces</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LACP negotiates membership; active speaks first, passive only answers.</li>
<li>Passive + passive never forms a bundle.</li>
<li>Healthy members show Collecting distributing and Receive State Current.</li>
<li>minimum-links takes the whole ae down when too few members are up.</li>
<li>All members must have the same speed.</li>
</ul></div>
`,hi:`
<p>Chapter 2 mein aapne <code>lacp active</code> ke saath ae0 banaya bina yeh poochhe ki iska matlab kya hai. LACP do switches ke beech chhoti si baatcheet hai jo woh bundle par bharosa karne se pehle karte hain. Yeh "mujhe lagta hai hum do cables se jude hain" aur "hum dono agree hain ki yeh do cables ek link hain" ka farak hai.</p>

<h3>Static LAG banaam LACP</h3>
<p><b>Static</b> LAG mein koi negotiation nahi hota. Har side bas maan leti hai ki doosri side sahi configured hai. Cable galat port mein lagi ho ya ek side bundled na ho, to kisi ko pata nahi chalta aur loop ya black hole ho sakta hai. <b>LACP</b> (Link Aggregation Control Protocol, IEEE 802.3ad, ab 802.1AX) har member par chhote control frames, LACPDUs, bhejta hai. Member bundle mein tabhi judta hai jab partner confirm kare ki woh usi bundle ka hissa hai. LACP us member ko bhi hata deta hai jiska partner chup ho jaaye, chahe physical link Up dikhe. Isliye LACP ko prefer karna chahiye.</p>

<h3>Active aur passive</h3>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td><code>lacp active</code></td><td>Khud LACPDUs bhejta hai</td></tr>
<tr><td><code>lacp passive</code></td><td>Sirf LACPDUs milne par jawab deta hai</td></tr></table>
<p>Combinations: active + active chalta hai; active + passive chalta hai; <b>passive + passive kabhi nahi chalta</b>, kyunki koi pehle nahi bolta. Best practice: kam se kam ek side active, aam taur par dono.</p>
<p><b>Timers.</b> Default slow hai: har 30 second mein ek LACPDU, aur lagbhag 90 second khamoshi ke baad member dead. <code>set interfaces ae0 aggregated-ether-options lacp periodic fast</code> har second ek bhejta hai (lagbhag 3 second mein dead). Fast timers one-way failure jaldi pakadte hain lekin thoda zyada CPU lete hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="LACP negotiation">
<rect x="40" y="30" width="120" height="120" rx="10" fill="#bbf7d0"/><text x="100" y="95" text-anchor="middle" class="svg-ink" font-size="14">DS1</text>
<rect x="480" y="30" width="120" height="120" rx="10" fill="#bbf7d0"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="14">AS1</text>
<line x1="160" y1="60" x2="480" y2="60" stroke="#7c3aed" stroke-width="2"/><text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">LACPDU: main system A, key 1, port 1</text>
<line x1="480" y1="100" x2="160" y2="100" stroke="#7c3aed" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">LACPDU: main system B, key 1, port 1</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Dono agree, to member Collecting + Distributing mein jaata hai</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Har member link apna exchange chalata hai</text>
</svg><p class="cap">Har member LACPDUs exchange karta hai. Sirf agreed members user traffic forward karte hain.</p></div>

<h3>show lacp interfaces padhna</h3>
<p>Yeh sabse zaroori LACP command hai. Healthy Nashik bundle ka real output:</p>
<pre class="out">lab@DS1&gt; show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/10      Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/10    Partner    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/11      Actor    No    No   Yes  Yes  Yes   Yes     Slow    Active
      ge-0/0/11    Partner    No    No   Yes  Yes  Yes   Yes     Slow    Active
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/10                  Current   Slow periodic  <span class="hl">Collecting distributing</span>
      ge-0/0/11                  Current   Slow periodic  <span class="hl">Collecting distributing</span></pre>
<ul>
<li><b>Actor</b> yeh switch hai, <b>Partner</b> far switch jaisa yeh switch use dekhta hai.</li>
<li><b>Dist</b> (distributing), <b>Col</b> (collecting) aur <b>Syn</b> (synchronised) teeno <b>Yes</b> matlab member poori tarah bundle mein hai.</li>
<li><b>Def</b> (defaulted) <b>Yes</b> matlab partner se kabhi koi LACPDU aaya hi nahi.</li>
<li>Protocol table: Receive State <b>Current</b> matlab partner baat kar raha hai; <b>Defaulted</b> matlab nahi. Mux State <b>Collecting distributing</b> target hai; <b>Detached</b> ya <b>Waiting</b> matlab member forward nahi kar raha.</li>
</ul>
<p>LACPDUs <code>show lacp statistics interfaces ae0</code> se ginte hain:</p>
<pre class="out">lab@DS1&gt; show lacp statistics interfaces ae0
Aggregated interface: ae0
    LACP Statistics:       LACP Rx     LACP Tx   Unknown Rx   Illegal Rx
      ge-0/0/10                   1           1            0            0
      ge-0/0/11                   1           1            0            0</pre>
<p>Dono members par Rx badhna saabit karta hai ki partner baat kar raha hai. Unknown ya Illegal counters badhna misconfigured partner ki taraf ishaara karta hai.</p>

<h3>Jab dono sides passive hon</h3>
<p>Yeh wahi bundle hai jisme dono ends par <code>lacp passive</code> hai aur koi bol nahi raha:</p>
<pre class="out">lab@SWA&gt; show lacp interfaces
Aggregated interface: ae0
    LACP state:       Role   Exp   Def  Dist  Col  Syn  Aggr  Timeout  Activity
      ge-0/0/4       Actor    No    No    No   No   No   Yes     Slow   Passive
      ge-0/0/4     Partner    No   <span class="hl">Yes</span>    No   No   No    No     Slow   Passive
    LACP protocol:        Receive State  Transmit State          Mux State
      ge-0/0/4                 <span class="hl">Defaulted</span>     No periodic                 <span class="hl">Detached</span></pre>
<p>Partner Defaulted = Yes, Receive Defaulted, Transmit No periodic, Mux Detached: kuch exchange nahi ho raha. Ek side ko active karo.</p>

<h3>minimum-links: jab aadha bundle zero se bura hai</h3>
<p>Maano bundle chaar 10G members par 8 Gbps traffic le jaata hai aur teen fail ho gaye. Bacha hua ek member load nahi utha sakta; users ko congestion aur loss dikhta hai jabki link "up" dikhta hai. <code>minimum-links N</code> poore ae interface ko down kar deta hai jab N se kam members active hon, taaki routing ya spanning tree traffic doosre path par le jaaye. Hamare lab mein do members ke saath <code>minimum-links 2</code> ka matlab: koi bhi member fail ho to poora bundle gir jaata hai. Ise un bundles par use karo jahan partial bundle nuksaan karta hai aur alternative path maujood hai.</p>

<h3>Speed rule</h3>
<p>Ek bundle ke members ki speed same honi chahiye. Alag speed par forced member bahar rehta hai; tab LACP uska Mux State <b>Waiting</b> dikhata hai jabki baaki <b>Collecting distributing</b> hote hain. Yahi aap troubleshooting lab mein dekhoge.</p>

<div class="eg"><p><b>Worked example.</b> DS1 ge-0/0/10 ko Collecting distributing aur ge-0/0/11 ko Waiting dikhata hai, Partner Syn = Yes lekin Actor Syn = No. Configuration mein ge-0/0/11 par <code>ether-options speed 100m</code> hai. Speed statement hatate hi dono members aggregate ho jaate hain aur bundle 2Gbps report karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf <code>show interfaces terse</code> dekhna. LACP ke detach karne par bhi member ports "up" hote hain. Hamesha <code>show lacp interfaces</code> check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Passive + passive bundle nahi banata. Static LAG (LACP statement ke bina) bina negotiation ke banta hai aur miscabling se koi bachav nahi deta.</p></div>

<div class="scn"><h4>Khamosh member</h4><p>Ek bank ke data-centre bundle mein chaar members the. Ek transceiver mein sirf ek direction mein fault aaya: switch transmit kar sakta tha lekin receive nahi. Port up raha, lekin LACPDUs wapas na aane par LACP ne 90 second mein member hata diya. Periodic fast ke saath wahi detection 3 second mein hota. Team ne critical bundles par timers badal diye.</p><p><b>Lesson:</b> LACP woh faults pakadta hai jo akela link state nahi pakad sakta.</p></div>

<div class="iv"><p class="q">"Static LAG aur LACP mein kya farak hai, aur kaunsa use karoge?"</p><p>Static LAG bina negotiation ke banta hai aur miscabling ya silent partner detect nahi kar sakta. LACP LACPDUs exchange karta hai, isliye sirf agreed members traffic forward karte hain aur failed members hat jaate hain. Main dono sides par active ke saath LACP use karta hoon, kabhi periodic fast, aur <code>show lacp interfaces</code> se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LACP membership negotiate karta hai; active pehle bolta hai, passive sirf jawab deta hai.</li>
<li>Passive + passive kabhi bundle nahi banata.</li>
<li>Healthy members Collecting distributing aur Receive State Current dikhate hain.</li>
<li>minimum-links kam members up hon to poora ae down kar deta hai.</li>
<li>Saare members ki speed same honi chahiye.</li>
</ul></div>
`}};export{e as default};