var e={id:`order-implicit-deny`,h:{en:`Policy order, first match, shadowing and the implicit deny`,hi:`Policy order, first match, shadowing aur implicit deny`},body:{en:`
<p>This chapter holds the single most tested rule of firewall policy: <b>policies are evaluated top to bottom in list order, and the first match wins</b>. Think of a queue at a ticket counter with a sign on each window. You go to the first window whose sign fits you. You never look at the windows behind it.</p>

<h3>List order is not ID order</h3>
<p>Every policy has an ID (<code>edit 3</code>). The ID is a label. The position in the list is the order. New policies are added at the <b>bottom</b>, but you can move any entry:</p>
<pre class="code">config firewall policy
    move 3 before 1
end</pre>
<p><code>move &lt;id&gt; before &lt;id&gt;</code> and <code>move &lt;id&gt; after &lt;id&gt;</code> change the position and leave the ID unchanged. In the GUI you drag the row. After a move, always run <code>show</code> and read the list from the top.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="First match wins">
<rect x="20" y="20" width="250" height="40" rx="8" fill="#fde68a"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 MKT-SOCIAL (accept, one PC)</text>
<rect x="20" y="70" width="250" height="40" rx="8" fill="#fed7aa"/><text x="145" y="95" text-anchor="middle" class="svg-ink" font-size="13">2 BLOCK-SOCIAL (deny, site)</text>
<rect x="20" y="120" width="250" height="40" rx="8" fill="#bbf7d0"/><text x="145" y="145" text-anchor="middle" class="svg-ink" font-size="13">3 LAN-to-WAN (accept, all)</text>
<rect x="20" y="170" width="250" height="32" rx="8" fill="#e2e8f0"/><text x="145" y="191" text-anchor="middle" class="svg-muted" font-size="12">implicit deny (policy 0)</text>
<text x="330" y="45" class="svg-ink" font-size="13">specific exception first</text>
<text x="330" y="95" class="svg-ink" font-size="13">then the block</text>
<text x="330" y="145" class="svg-ink" font-size="13">then the general allow</text>
<text x="330" y="191" class="svg-ink" font-size="13">then nothing matched: drop</text>
<line x1="300" y1="30" x2="300" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Specific above general. The list is read once, from the top.</p></div>

<h3>The implicit deny, policy 0</h3>
<p>At the very bottom of every FortiGate list is a rule you cannot see, edit or delete: the <b>implicit deny</b>. Any session that matches no policy lands there and is dropped. Tools display it as <b>policy id 0</b>. By default it writes no log. To see these drops in the traffic log, enable it once:</p>
<pre class="code">config log setting
    set fwpolicy-implicit-log enable
end</pre>
<p>Remember that you can also add an explicit "deny all, log all" policy at the bottom with a real ID. That one is a normal list entry, it can log per policy and it has its own hit counter.</p>

<h3>Shadowing: when a policy can never be reached</h3>
<p>A policy is <b>shadowed</b> when an earlier policy matches everything it would match. The lower policy then shows zero hits forever. Shadowing has two flavours. A broad <i>deny</i> above a narrow accept blocks the exception. A broad <i>accept</i> above a narrow deny lets forbidden traffic through, which is a security hole. Both are caused by wrong order, not by wrong objects.</p>
<p>Here is the ticket from the lab. HR asked to block one social site. The change record says the new policy 1 is "BLOCK-SOCIAL" but the engineer left source, destination and service as "all". The list now reads:</p>
<pre class="out">FGT1 # show firewall policy
config firewall policy
    edit 1
        set name "BLOCK-SOCIAL"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
    edit 2
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end</pre>
<p>There is no <code>set action</code> line in policy 1, so it uses the default <b>deny</b>. With destination "all" it blocks the whole internet. Policy 2 is shadowed.</p>
<pre class="out">FGT1 # diagnose firewall iprope show 100004 1
idx=1 pkts/bytes=0/0 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:10</span> first:2026-10-02 03:40:04 last:2026-10-02 03:40:04
established session count:0
FGT1 # diagnose firewall iprope show 100004 2
idx=2 pkts/bytes=0/0 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:0</span></pre>
<p>The shadow is visible in the counters: policy 1 has ten hits, policy 2 has none.</p>

<h3>The fix: narrow the deny, add the exception above it</h3>
<pre class="code">config firewall address
    edit SOCIAL_SITE
        set subnet 198.51.100.10/32
    next
    edit MKT_PC
        set subnet 10.0.1.20/32
    next
end
config firewall policy
    edit 1
        set dstaddr SOCIAL_SITE
    next
    edit 3
        set name MKT-SOCIAL
        set srcintf port2
        set dstintf port1
        set srcaddr MKT_PC
        set dstaddr SOCIAL_SITE
        set action accept
        set schedule always
        set service HTTPS
        set nat enable
    next
    move 3 before 1
end</pre>
<pre class="out">FGT1 # get firewall policy
== [ 3 ]
policyid: 3   name: MKT-SOCIAL   uuid: 973432cd-c625-513e-b900-7e812d886255
== [ 1 ]
policyid: 1   name: BLOCK-SOCIAL   uuid: c419304d-fa62-513a-b900-7e81c948a7ab
== [ 2 ]
policyid: 2   name: LAN-to-WAN   uuid: fb324c99-ae12-51c2-b900-7e814d083808
FGT1 # diagnose firewall iprope lookup 10.0.1.20 50000 198.51.100.10 443 tcp port2
&lt;src [10.0.1.20-50000] dst [198.51.100.10-443] proto tcp dev port2&gt; <span class="hl">matches policy id: 3</span>
FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 198.51.100.10 443 tcp port2
&lt;src [10.0.1.10-50000] dst [198.51.100.10-443] proto tcp dev port2&gt; <span class="hl">matches policy id: 1</span></pre>
<p>The list order is now 3, 1, 2. The marketing PC hits policy 3 and everyone else hits the block. The block also catches marketing on any other service, such as ping, because the exception only allows HTTPS.</p>

<div class="warn"><p><b>Common beginner mistakes.</b> Reading the ID as the order; adding an exception at the bottom (it is never reached); fixing a shadow by deleting the "wrong" policy instead of narrowing it; assuming the implicit deny is logged. Another trap: a changed policy affects <i>new</i> sessions. An old session may keep passing until it ends or is cleared.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which policy is evaluated first, ID 2 or ID 5?" It depends only on the list position. Also, a policy with <code>status disable</code> is skipped as if it did not exist, so a disabled deny lets traffic fall through to the next match.</p></div>

<div class="scn"><h4>The "temporary" any-any rule</h4><p>During a migration an engineer inserted "ANY-ANY accept" at the top to test connectivity and forgot it. Months later an audit found a server segment reachable from guest Wi-Fi. Every careful deny below the top rule had zero hits. Moving the test rule to the bottom of the list, or deleting it, restored the intended security.</p><p><b>Lesson:</b> review hit counts. A deny with zero hits and a broad accept above it is a classic shadow.</p></div>

<div class="iv"><p class="q">"Two policies both match a session. Which one does FortiGate use?"</p><p>The one that appears first in the list, regardless of ID. Explain top-down, first-match, and that specific policies belong above general ones. Mention the implicit deny as policy 0, <code>move before/after</code> for re-ordering, and hit counters or the policy lookup tool to prove it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies are checked top-down in list order; the first match decides.</li>
<li>The ID is a label; <code>move X before Y</code> changes the order, not the ID.</li>
<li>Nothing matched means the implicit deny (policy 0), unlogged unless <code>fwpolicy-implicit-log</code> is on.</li>
<li>A broad policy above a narrow one shadows it; zero hit counts expose this.</li>
<li>Put specific exceptions above general rules, then verify with <code>show</code> and the lookup tool.</li>
</ul></div>
`,hi:`
<p>Is chapter mein firewall policy ka sabse zyada poochha jaane wala rule hai: <b>policies list order mein upar se neeche evaluate hoti hain, aur pehla match jeetta hai</b>. Ticket counter ki queue socho jahan har window par ek board laga hai. Aap pehli us window par jaate ho jiska board aap par fit ho. Uske peeche wali windows aap kabhi nahi dekhte.</p>

<h3>List order, ID order nahi</h3>
<p>Har policy ki ek ID hoti hai (<code>edit 3</code>). ID ek label hai. List mein position hi order hai. Nayi policies <b>neeche</b> add hoti hain, lekin aap koi bhi entry move kar sakte ho:</p>
<pre class="code">config firewall policy
    move 3 before 1
end</pre>
<p><code>move &lt;id&gt; before &lt;id&gt;</code> aur <code>move &lt;id&gt; after &lt;id&gt;</code> position badalte hain aur ID wahi rehti hai. GUI mein aap row drag karte ho. Move ke baad hamesha <code>show</code> chalao aur list upar se padho.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="First match wins">
<rect x="20" y="20" width="250" height="40" rx="8" fill="#fde68a"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 MKT-SOCIAL (accept, ek PC)</text>
<rect x="20" y="70" width="250" height="40" rx="8" fill="#fed7aa"/><text x="145" y="95" text-anchor="middle" class="svg-ink" font-size="13">2 BLOCK-SOCIAL (deny, site)</text>
<rect x="20" y="120" width="250" height="40" rx="8" fill="#bbf7d0"/><text x="145" y="145" text-anchor="middle" class="svg-ink" font-size="13">3 LAN-to-WAN (accept, all)</text>
<rect x="20" y="170" width="250" height="32" rx="8" fill="#e2e8f0"/><text x="145" y="191" text-anchor="middle" class="svg-muted" font-size="12">implicit deny (policy 0)</text>
<text x="330" y="45" class="svg-ink" font-size="13">specific exception pehle</text>
<text x="330" y="95" class="svg-ink" font-size="13">phir block</text>
<text x="330" y="145" class="svg-ink" font-size="13">phir general allow</text>
<text x="330" y="191" class="svg-ink" font-size="13">phir kuch match nahi: drop</text>
<line x1="300" y1="30" x2="300" y2="195" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Specific upar, general neeche. List ek baar upar se padhi jaati hai.</p></div>

<h3>Implicit deny, policy 0</h3>
<p>Har FortiGate list ke bilkul neeche ek rule hota hai jo aap dekh, edit ya delete nahi kar sakte: <b>implicit deny</b>. Jo session kisi policy se match nahi karta woh wahin girta hai aur drop hota hai. Tools ise <b>policy id 0</b> ke roop mein dikhate hain. Default mein yeh koi log nahi likhta. Traffic log mein yeh drops dekhne ke liye ek baar enable karo:</p>
<pre class="code">config log setting
    set fwpolicy-implicit-log enable
end</pre>
<p>Yaad rakho ki aap neeche asli ID wali ek explicit "deny all, log all" policy bhi daal sakte ho. Woh normal list entry hai, per-policy log kar sakti hai aur uska apna hit counter hota hai.</p>

<h3>Shadowing: jab policy tak kabhi pahunchte hi nahi</h3>
<p>Policy <b>shadowed</b> hoti hai jab pehle ki policy woh sab match kar leti hai jo neeche wali karti. Tab neeche wali ke hits hamesha zero rehte hain. Shadowing ke do roop hain. Narrow accept ke upar broad <i>deny</i> exception ko block kar deta hai. Narrow deny ke upar broad <i>accept</i> forbidden traffic ko pass kar deta hai, jo security hole hai. Dono galat order se hote hain, galat objects se nahi.</p>
<p>Lab ka ticket yeh hai. HR ne ek social site block karne ko kaha. Change record kehta hai nayi policy 1 "BLOCK-SOCIAL" hai, lekin engineer ne source, destination aur service "all" chhod diye. Ab list aisi hai:</p>
<pre class="out">FGT1 # show firewall policy
config firewall policy
    edit 1
        set name "BLOCK-SOCIAL"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
    edit 2
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end</pre>
<p>Policy 1 mein <code>set action</code> line nahi hai, isliye woh default <b>deny</b> use karti hai. Destination "all" ke saath woh poora internet block karti hai. Policy 2 shadowed hai.</p>
<pre class="out">FGT1 # diagnose firewall iprope show 100004 1
idx=1 pkts/bytes=0/0 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:10</span> first:2026-10-02 03:40:04 last:2026-10-02 03:40:04
established session count:0
FGT1 # diagnose firewall iprope show 100004 2
idx=2 pkts/bytes=0/0 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:0</span></pre>
<p>Shadow counters mein dikhta hai: policy 1 ke das hits hain, policy 2 ke koi nahi.</p>

<h3>Fix: deny ko narrow karo, exception uske upar daalo</h3>
<pre class="code">config firewall address
    edit SOCIAL_SITE
        set subnet 198.51.100.10/32
    next
    edit MKT_PC
        set subnet 10.0.1.20/32
    next
end
config firewall policy
    edit 1
        set dstaddr SOCIAL_SITE
    next
    edit 3
        set name MKT-SOCIAL
        set srcintf port2
        set dstintf port1
        set srcaddr MKT_PC
        set dstaddr SOCIAL_SITE
        set action accept
        set schedule always
        set service HTTPS
        set nat enable
    next
    move 3 before 1
end</pre>
<pre class="out">FGT1 # get firewall policy
== [ 3 ]
policyid: 3   name: MKT-SOCIAL   uuid: 973432cd-c625-513e-b900-7e812d886255
== [ 1 ]
policyid: 1   name: BLOCK-SOCIAL   uuid: c419304d-fa62-513a-b900-7e81c948a7ab
== [ 2 ]
policyid: 2   name: LAN-to-WAN   uuid: fb324c99-ae12-51c2-b900-7e814d083808
FGT1 # diagnose firewall iprope lookup 10.0.1.20 50000 198.51.100.10 443 tcp port2
&lt;src [10.0.1.20-50000] dst [198.51.100.10-443] proto tcp dev port2&gt; <span class="hl">matches policy id: 3</span>
FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 198.51.100.10 443 tcp port2
&lt;src [10.0.1.10-50000] dst [198.51.100.10-443] proto tcp dev port2&gt; <span class="hl">matches policy id: 1</span></pre>
<p>List order ab 3, 1, 2 hai. Marketing PC policy 3 hit karta hai aur baaki sab block hit karte hain. Block marketing ko bhi kisi aur service, jaise ping, par rokta hai, kyunki exception sirf HTTPS allow karti hai.</p>

<div class="warn"><p><b>Common beginner mistakes.</b> ID ko order samajhna; exception ko neeche add karna (wahan tak pahunchte hi nahi); shadow ko "galat" policy delete karke theek karna, narrow karne ki jagah; implicit deny ko logged maan lena. Ek aur jaal: badli hui policy <i>naye</i> sessions par asar karti hai. Purana session khatam hone ya clear hone tak pass hota reh sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "ID 2 ya ID 5, kaunsi pehle evaluate hogi?" Yeh sirf list position par depend karta hai. Yeh bhi: <code>status disable</code> wali policy aise skip hoti hai jaise woh hai hi nahi, isliye disabled deny traffic ko agle match tak girne deta hai.</p></div>

<div class="scn"><h4>"Temporary" any-any rule</h4><p>Migration ke dauran ek engineer ne connectivity test ke liye sabse upar "ANY-ANY accept" daala aur bhool gaya. Mahino baad audit mein pata chala ki guest Wi-Fi se server segment reachable tha. Upar wale rule ke neeche har dhyan se banaya deny zero hits par tha. Test rule ko list ke neeche karne ya delete karne se intended security wapas aayi.</p><p><b>Lesson:</b> hit counts review karo. Zero hits wala deny aur uske upar broad accept classic shadow hai.</p></div>

<div class="iv"><p class="q">"Do policies ek session ko match karti hain. FortiGate kaunsi use karta hai?"</p><p>Jo list mein pehle aati hai, ID se koi matlab nahi. Top-down, first-match samjhao, aur yeh ki specific policies general se upar hoti hain. Implicit deny ko policy 0 ke roop mein, re-ordering ke liye <code>move before/after</code>, aur saabit karne ke liye hit counters ya policy lookup tool ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies list order mein upar se neeche check hoti hain; pehla match decide karta hai.</li>
<li>ID label hai; <code>move X before Y</code> order badalta hai, ID nahi.</li>
<li>Kuch match na ho to implicit deny (policy 0), jo <code>fwpolicy-implicit-log</code> on hone tak log nahi hota.</li>
<li>Broad policy narrow wali ko upar se shadow karti hai; zero hit counts isse expose karte hain.</li>
<li>Specific exceptions general rules ke upar rakho, phir <code>show</code> aur lookup tool se verify karo.</li>
</ul></div>
`}};export{e as default};