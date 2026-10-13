var e={id:`port-security`,h:{en:`Port security in depth: limits, sticky MACs, violations and recovery`,hi:`Port security gehraai se: limits, sticky MACs, violations aur recovery`},body:{en:`
<p>A small private party has a doorman with a guest list and a rule: "each invitation admits at most two people". The first two faces he sees with an invitation go on his list. If a third stranger tries the same invitation, the doorman can quietly turn him away, turn him away and write it in his notebook, or close the door for everybody on that invitation until the host comes to sort it out. <b>Port security</b> is that doorman for a switch port, and those three reactions are its three <b>violation modes</b>.</p>

<h3>What port security does</h3>
<p>Port security limits <b>how many</b> source MAC addresses, and optionally <b>which</b> ones, may send traffic through a port. Addresses allowed on the port are called <b>secure MAC addresses</b>. When a frame arrives from a new MAC and the port already holds its maximum, or when a secure MAC of this port appears on another secured port, that is a <b>violation</b>.</p>
<p>Key facts and defaults:</p>
<ul>
<li>The port must be <b>statically</b> access or trunk. On a dynamic port IOS answers <code>Command rejected: Gi0/1 is a dynamic port.</code></li>
<li>Enabling it with <code>switchport port-security</code> gives: maximum <b>1</b> MAC, violation mode <b>shutdown</b>, aging <b>disabled</b>.</li>
<li>Configuring options without the bare <code>switchport port-security</code> line does not turn the feature on.</li>
</ul>

<h3>Three kinds of secure MAC</h3>
<dl class="terms">
<dt>Static</dt><dd>Typed by you: <code>switchport port-security mac-address 0050.7900.0a11</code>. Stored in the configuration.</dd>
<dt>Dynamic</dt><dd>Learned from traffic, kept only in the MAC table; lost when the port goes down or the switch reloads.</dd>
<dt>Sticky</dt><dd>Learned from traffic <b>and written into the running configuration</b> as <code>switchport port-security mac-address sticky 0050.7900.0a11</code>. Save the configuration and they survive a reload. This is the easiest way to lock a port to whatever is plugged in today.</dd>
</dl>

<h3>The three violation modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Offending frames</th><th>Violation counter</th><th>Syslog / SNMP</th><th>Port</th></tr>
<tr><td>protect</td><td>Dropped</td><td>No</td><td>No</td><td>Stays up</td></tr>
<tr><td>restrict</td><td>Dropped</td><td>Yes, per frame</td><td>Yes</td><td>Stays up</td></tr>
<tr><td>shutdown (default)</td><td>Port stops</td><td>Yes (becomes 1)</td><td>Yes</td><td>err-disabled</td></tr></table>
<p>In protect and restrict, the existing secure hosts keep working. Protect is silent, which is bad for a defender: you never learn the attack happened. Restrict is a good choice where uptime matters; shutdown is the strongest and the default.</p>

<h3>Lab 1 walkthrough: MAC flooding vs port security</h3>
<p>On ACC1, PC1 is on Gi0/1 and the simulated attacker ATK on Gi0/2. Both ports are already access ports in VLAN 10 with PortFast.</p>
<pre class="code"><span class="c">! task 1: lock both edge ports</span>
interface range g0/1 - 2
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
 exit
<span class="c">! task 2: come back automatically after 30 seconds</span>
errdisable recovery cause psecure-violation
errdisable recovery interval 30</pre>
<p>Now run <code>attack macflood</code> on ATK. The first two MACs from Gi0/2 are learned as sticky; the third new MAC is a violation, and the port is err-disabled. The switch logs it:</p>
<pre class="out"><span class="hl">%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 3a1f.09c2.7d10 on port GigabitEthernet0/2.</span>
%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/2, putting Gi0/2 in err-disable state
%LINK-3-UPDOWN: Interface GigabitEthernet0/2, changed state to down</pre>
<pre class="out">ACC1# show port-security interface g0/2
Port Security              : Enabled
<span class="hl">Port Status                : Secure-shutdown</span>
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 2
Total MAC Addresses        : 2
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 2
Last Source Address:Vlan   : 3a1f.09c2.7d10:10
<span class="hl">Security Violation Count   : 1</span></pre>
<p>The answer the lab asks for is the <b>Security Violation Count</b>: 1. In shutdown mode the counter stops at 1 because the port is down after the first violation. Gi0/1 (PC1) is untouched, which you confirm with <code>show port-security</code>:</p>
<pre class="out">ACC1# show port-security
Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
                (Count)       (Count)          (Count)
---------------------------------------------------------------------------
      Gi0/1              2            1                  0         Shutdown
<span class="hl">      Gi0/2              2            2                  1         Shutdown</span>
---------------------------------------------------------------------------</pre>

<h3>Getting a port back</h3>
<p>An err-disabled port recovers in one of two ways. Manually, with <code>shutdown</code> then <code>no shutdown</code> on the interface (after removing the cause). Automatically, with <code>errdisable recovery cause psecure-violation</code>; the default interval is 300 seconds, and the lab sets 30. <code>show errdisable recovery</code> shows the timer and the seconds left per interface. If the attacker is still flooding, the port simply violates again and goes back down, and every cycle is logged.</p>

<h3>Aging and clean-up</h3>
<p><code>switchport port-security aging time 10</code> removes secure addresses after 10 minutes; <code>aging type inactivity</code> counts from the last frame instead of from learning (absolute, the default). To replace an approved device, clear its sticky entry with <code>clear port-security sticky interface g0/1</code>, let the new MAC be learned and save the configuration.</p>

<div class="eg"><p><b>Worked example: a phone port.</b> A desk has an IP phone (voice VLAN 20) with a PC behind it (VLAN 10). The phone's MAC is learned in the voice VLAN, the PC's in the data VLAN, and on some platforms the phone also appears in the data VLAN for CDP/LLDP. A safe setting is maximum 3, or per-VLAN limits: <code>switchport port-security maximum 2</code> plus <code>switchport port-security maximum 1 vlan voice</code>. Maximum 1 on this port causes a violation the moment the PC boots.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using sticky learning and never saving. The sticky lines live in the running configuration; after a reload the port relearns whatever is connected first, which may be the wrong device.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default violation mode is <b>shutdown</b>, default maximum is <b>1</b>. <b>protect</b> does not increment the counter or log; <b>restrict</b> does both. Sticky is a learning method, not a violation mode.</p></div>

<div class="scn"><h4>The docking station that broke hot-desking</h4><p>After port security (maximum 1, sticky, shutdown) was rolled out on a hot-desk floor, dozens of ports went err-disabled every morning. <code>show interfaces status err-disabled</code> listed psecure-violation, and the "Last Source Address" on each port was a different laptop. Hot-desk users brought different laptops to the same docking station every day, but sticky had locked each port to Monday's laptop. The fix was maximum 2 with aging time 480 and aging type inactivity on hot-desk ports, restrict mode for visibility, and 802.1X on the roadmap.</p><p><b>Lesson:</b> pick the maximum, aging and violation mode per port role. Sticky with maximum 1 suits fixed devices, not shared desks.</p></div>

<div class="iv"><p class="q">"Compare protect, restrict and shutdown. Which would you deploy?"</p><p>Strong answer: all three drop frames from unauthorised MACs. Protect is silent, restrict adds a per-frame counter plus syslog and SNMP traps, shutdown err-disables the whole port and is the default. I use shutdown with errdisable recovery on normal user ports because it stops the attacker completely and is visible; restrict where a port must never go down, for example a shared conference room; never protect, because a defender needs the log. Mention the defaults and the static-mode requirement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port security limits the number (and optionally the identity) of source MACs on a statically configured port.</li>
<li>Defaults: maximum 1, violation shutdown, aging disabled.</li>
<li>Secure MACs: static, dynamic, sticky (written to the running configuration; save it).</li>
<li>protect drops silently; restrict drops, counts and logs; shutdown err-disables the port.</li>
<li>Recover with shutdown / no shutdown or <code>errdisable recovery cause psecure-violation</code> (default 300 s).</li>
</ul></div>
`,hi:`
<p>Ek chhoti private party mein ek doorman hai jiske paas guest list hai aur ek rule: "har invitation par zyada se zyada do log". Invitation ke saath jo pehle do chehre woh dekhta hai, woh uski list mein chale jaate hain. Agar teesra ajnabi wahi invitation try kare, to doorman use chup-chaap lauta sakta hai, lauta kar apni notebook mein likh sakta hai, ya us invitation wale sabke liye darwaaza band kar sakta hai jab tak host aakar maamla na suljhaaye. <b>Port security</b> switch port ka wahi doorman hai, aur woh teen reactions uske teen <b>violation modes</b> hain.</p>

<h3>Port security kya karta hai</h3>
<p>Port security limit karta hai ki <b>kitne</b> source MAC addresses, aur optionally <b>kaunse</b>, port se traffic bhej sakte hain. Port par allowed addresses ko <b>secure MAC addresses</b> kehte hain. Jab kisi naye MAC se frame aaye aur port pehle se apne maximum par ho, ya jab is port ka koi secure MAC kisi doosre secured port par dikhe, to woh <b>violation</b> hai.</p>
<p>Key facts aur defaults:</p>
<ul>
<li>Port <b>statically</b> access ya trunk hona chahiye. Dynamic port par IOS jawab deta hai <code>Command rejected: Gi0/1 is a dynamic port.</code></li>
<li><code>switchport port-security</code> se enable karne par milta hai: maximum <b>1</b> MAC, violation mode <b>shutdown</b>, aging <b>disabled</b>.</li>
<li>Bina akeli <code>switchport port-security</code> line ke options configure karne se feature on nahi hota.</li>
</ul>

<h3>Teen tarah ke secure MAC</h3>
<dl class="terms">
<dt>Static</dt><dd>Aap type karte ho: <code>switchport port-security mac-address 0050.7900.0a11</code>. Configuration mein store hota hai.</dd>
<dt>Dynamic</dt><dd>Traffic se seekha gaya, sirf MAC table mein rehta hai; port down hone ya switch reload hone par kho jaata hai.</dd>
<dt>Sticky</dt><dd>Traffic se seekha gaya <b>aur running configuration mein likha gaya</b>, <code>switchport port-security mac-address sticky 0050.7900.0a11</code> ki tarah. Configuration save karo to reload ke baad bhi bache rehte hain. Aaj jo bhi plug hai us par port lock karne ka sabse aasaan tareeka yahi hai.</dd>
</dl>

<h3>Teen violation modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Galat frames</th><th>Violation counter</th><th>Syslog / SNMP</th><th>Port</th></tr>
<tr><td>protect</td><td>Drop</td><td>Nahi</td><td>Nahi</td><td>Up rehta hai</td></tr>
<tr><td>restrict</td><td>Drop</td><td>Haan, har frame par</td><td>Haan</td><td>Up rehta hai</td></tr>
<tr><td>shutdown (default)</td><td>Port ruk jaata hai</td><td>Haan (1 ho jaata hai)</td><td>Haan</td><td>err-disabled</td></tr></table>
<p>Protect aur restrict mein maujooda secure hosts kaam karte rehte hain. Protect khamosh hai, jo defender ke liye bura hai: aapko kabhi pata nahi chalta ki attack hua. Jahan uptime zaroori ho wahan restrict achha choice hai; shutdown sabse strong aur default hai.</p>

<h3>Lab 1 walkthrough: MAC flooding vs port security</h3>
<p>ACC1 par PC1 Gi0/1 par hai aur simulated attacker ATK Gi0/2 par. Dono ports pehle se VLAN 10 mein PortFast ke saath access ports hain.</p>
<pre class="code"><span class="c">! task 1: dono edge ports lock karo</span>
interface range g0/1 - 2
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
 exit
<span class="c">! task 2: 30 seconds baad automatically wapas aao</span>
errdisable recovery cause psecure-violation
errdisable recovery interval 30</pre>
<p>Ab ATK par <code>attack macflood</code> chalao. Gi0/2 se pehle do MACs sticky ki tarah seekhe jaate hain; teesra naya MAC violation hai, aur port err-disable ho jaata hai. Switch ise log karta hai:</p>
<pre class="out"><span class="hl">%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 3a1f.09c2.7d10 on port GigabitEthernet0/2.</span>
%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/2, putting Gi0/2 in err-disable state
%LINK-3-UPDOWN: Interface GigabitEthernet0/2, changed state to down</pre>
<pre class="out">ACC1# show port-security interface g0/2
Port Security              : Enabled
<span class="hl">Port Status                : Secure-shutdown</span>
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 2
Total MAC Addresses        : 2
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 2
Last Source Address:Vlan   : 3a1f.09c2.7d10:10
<span class="hl">Security Violation Count   : 1</span></pre>
<p>Lab jo jawab maangti hai woh <b>Security Violation Count</b> hai: 1. Shutdown mode mein counter 1 par ruk jaata hai kyunki pehle violation ke baad port down hai. Gi0/1 (PC1) ko kuch nahi hua, jo aap <code>show port-security</code> se confirm karte ho:</p>
<pre class="out">ACC1# show port-security
Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
                (Count)       (Count)          (Count)
---------------------------------------------------------------------------
      Gi0/1              2            1                  0         Shutdown
<span class="hl">      Gi0/2              2            2                  1         Shutdown</span>
---------------------------------------------------------------------------</pre>

<h3>Port wapas kaise laayein</h3>
<p>Err-disabled port do tareekon mein se ek se recover hota hai. Manually, interface par <code>shutdown</code> phir <code>no shutdown</code> se (cause hatane ke baad). Automatically, <code>errdisable recovery cause psecure-violation</code> se; default interval 300 seconds hai, aur lab 30 set karti hai. <code>show errdisable recovery</code> timer aur har interface ke bache seconds dikhata hai. Agar attacker ab bhi flood kar raha hai, to port phir violate karta hai aur wapas down ho jaata hai, aur har cycle log hoti hai.</p>

<h3>Aging aur saaf-safaai</h3>
<p><code>switchport port-security aging time 10</code> secure addresses ko 10 minute baad hata deta hai; <code>aging type inactivity</code> seekhne se nahi balki aakhri frame se ginta hai (absolute default hai). Kisi approved device ko badalne ke liye, uski sticky entry <code>clear port-security sticky interface g0/1</code> se clear karo, naya MAC seekhne do aur configuration save karo.</p>

<div class="eg"><p><b>Worked example: phone port.</b> Ek desk par IP phone (voice VLAN 20) hai aur uske peeche PC (VLAN 10). Phone ka MAC voice VLAN mein seekha jaata hai, PC ka data VLAN mein, aur kuch platforms par phone CDP/LLDP ke liye data VLAN mein bhi dikhta hai. Surakshit setting maximum 3 hai, ya per-VLAN limits: <code>switchport port-security maximum 2</code> plus <code>switchport port-security maximum 1 vlan voice</code>. Is port par maximum 1 PC boot hote hi violation karwata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Sticky learning use karna aur kabhi save na karna. Sticky lines running configuration mein rehti hain; reload ke baad port jo bhi pehle connect ho use seekh leta hai, jo galat device ho sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default violation mode <b>shutdown</b> hai, default maximum <b>1</b>. <b>protect</b> counter nahi badhata aur log nahi karta; <b>restrict</b> dono karta hai. Sticky ek learning method hai, violation mode nahi.</p></div>

<div class="scn"><h4>Docking station jisne hot-desking tod di</h4><p>Hot-desk floor par port security (maximum 1, sticky, shutdown) roll out hone ke baad, har subah darjanon ports err-disabled ho jaate the. <code>show interfaces status err-disabled</code> psecure-violation dikhata tha, aur har port par "Last Source Address" alag laptop ka tha. Hot-desk users roz same docking station par alag laptops laate the, par sticky ne har port ko Monday ke laptop par lock kar diya tha. Fix tha hot-desk ports par maximum 2 ke saath aging time 480 aur aging type inactivity, visibility ke liye restrict mode, aur roadmap par 802.1X.</p><p><b>Seekh:</b> har port role ke hisaab se maximum, aging aur violation mode chuno. Maximum 1 ke saath sticky fixed devices ke liye theek hai, shared desks ke liye nahi.</p></div>

<div class="iv"><p class="q">"Protect, restrict aur shutdown compare karo. Aap kaunsa deploy karoge?"</p><p>Strong answer: teeno unauthorised MACs ke frames drop karte hain. Protect khamosh hai, restrict har frame ka counter plus syslog aur SNMP traps jodta hai, shutdown poore port ko err-disable karta hai aur default hai. Normal user ports par main errdisable recovery ke saath shutdown use karta hoon kyunki yeh attacker ko poori tarah rokta hai aur dikhta hai; restrict wahan jahan port kabhi down nahi hona chahiye, jaise shared conference room; protect kabhi nahi, kyunki defender ko log chahiye. Defaults aur static-mode requirement bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port security statically configured port par source MACs ki ginti (aur optionally identity) limit karta hai.</li>
<li>Defaults: maximum 1, violation shutdown, aging disabled.</li>
<li>Secure MACs: static, dynamic, sticky (running configuration mein likha jaata hai; save karo).</li>
<li>protect chup-chaap drop karta hai; restrict drop, count aur log karta hai; shutdown port err-disable karta hai.</li>
<li>Recover karo shutdown / no shutdown se ya <code>errdisable recovery cause psecure-violation</code> se (default 300 s).</li>
</ul></div>
`}};export{e as default};