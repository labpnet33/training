var e={id:`psec-modes`,h:{en:`Violation modes, counters and aging`,hi:`Violation modes, counters aur aging`},body:{en:`
<p>Back to the hotel door. When a stranger tries a key card, the hotel can react in three ways. It can silently ignore the card. It can refuse the card and log the attempt at the front desk. Or it can lock the door completely until a manager comes to reset it. Port security has exactly these three reactions, called <b>violation modes</b>: <b>protect</b>, <b>restrict</b> and <b>shutdown</b>.</p>

<h3>The three violation modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Offending frames</th><th>Violation counter</th><th>Syslog / SNMP trap</th><th>Port state</th></tr>
<tr><td><b>protect</b></td><td>Dropped</td><td>Not increased</td><td>No</td><td>Stays up</td></tr>
<tr><td><b>restrict</b></td><td>Dropped</td><td>Increased per frame</td><td>Yes</td><td>Stays up</td></tr>
<tr><td><b>shutdown</b> (default)</td><td>Port stops all traffic</td><td>Increased (to 1)</td><td>Yes</td><td>err-disabled</td></tr>
</table>
<p>In every mode, the <b>secure</b> MACs keep working in protect and restrict. Only the extra, unknown MACs are dropped. In shutdown mode the whole port goes down, so even the legitimate device loses its connection until someone recovers the port (next chapter).</p>
<p>How to choose: <b>shutdown</b> for high-security ports where any stranger is an incident (reception, ATMs, server rooms). <b>restrict</b> where the business must keep running but you still want evidence (a busy teller desk). <b>protect</b> is rarely a good idea, because an attack leaves no trace at all.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Violation modes compared">
<rect x="10" y="10" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">protect</text>
<text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="12">drop stranger</text><text x="110" y="100" text-anchor="middle" class="svg-muted" font-size="12">no counter, no log</text><text x="110" y="140" text-anchor="middle" class="svg-accent" font-size="13">port UP</text>
<rect x="220" y="10" width="200" height="170" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">restrict</text>
<text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">drop stranger</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">counter +1, syslog</text><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">port UP</text>
<rect x="430" y="10" width="200" height="170" rx="10" fill="#fed7aa"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">shutdown</text>
<text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">whole port stops</text><text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">counter +1, syslog</text><text x="530" y="140" text-anchor="middle" class="svg-accent" font-size="13">err-disabled</text>
</svg><p class="cap">Protect is silent, restrict keeps evidence, shutdown stops everything.</p></div>

<div class="eg"><p><b>Worked example.</b> The Godavari Bank teller desk (SW1 Gi0/2) serves PC2 (0050.7966.0a02) and a passbook printer. Two devices means maximum 2. The desk cannot go down in the middle of a customer transaction, so the mode is restrict. If a third device appears, its frames are dropped, the counter rises and a syslog message tells the NOC, but PC2 and the printer keep working.</p></div>

<h3>Configuration</h3>
<pre class="code">SW1(config)# interface g0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 2
SW1(config-if)# switchport port-security violation restrict
SW1(config-if)# end</pre>

<h3>Verification: the summary table</h3>
<pre class="out">SW1# show port-security
Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
                (Count)       (Count)          (Count)
---------------------------------------------------------------------------
      Gi0/1              1            1                  0         Shutdown
<span class="hl">      Gi0/2              2            2                 37         Restrict</span>
---------------------------------------------------------------------------
Total Addresses in System (excluding one mac per port)     : 1
Max Addresses limit in System (excluding one mac per port) : 4096</pre>
<p>Gi0/2 has 37 violations but is still forwarding. In restrict mode the counter increases for <b>every</b> dropped frame, so a large number does not mean 37 different intruders; it may be one device that sent 37 frames. The matching log looks like this:</p>
<pre class="out"><span class="hl">%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0bad.0bad.0002 on port GigabitEthernet0/2.</span></pre>
<p>The same message appears in shutdown mode, followed by <code>%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/1, putting Gi0/1 in err-disable state</code>. In protect mode nothing is logged.</p>

<h3>Aging: letting secure addresses expire</h3>
<p>By default, secure addresses never age out (aging time 0). That suits fixed desks, but not a shared hot-desk or a training room where laptops change every day. <b>Aging</b> removes secure addresses after a timer so new devices can be learned without clearing anything by hand.</p>
<pre class="code">SW1(config-if)# switchport port-security aging time 60          <span class="c">! minutes, 1-1440</span>
SW1(config-if)# switchport port-security aging type inactivity  <span class="c">! or absolute (default)</span>
SW1(config-if)# switchport port-security aging static           <span class="c">! also age static entries</span></pre>
<ul>
<li><b>absolute</b>: the address is removed exactly when the timer expires, even if the device is still talking (it is then relearned).</li>
<li><b>inactivity</b>: the address is removed only if no traffic was seen from it for the whole timer.</li>
<li>Aging applies to <b>dynamic</b> addresses, and to <b>static</b> ones only with <code>aging static</code>. Sticky addresses are not aged out.</li>
</ul>
<pre class="out">SW1# show port-security address
Vlan    Mac Address       Type                          Ports   Remaining Age
----    -----------       ----                          -----   -------------
<span class="hl">   1    0050.7966.0a02    SecureDynamic                 Gi0/2       54</span>
   1    0050.7966.0b07    SecureDynamic                 Gi0/2       60</pre>

<h3>Clearing secure addresses</h3>
<pre class="code">SW1# clear port-security dynamic interface g0/2
SW1# clear port-security sticky interface g0/1   <span class="c">! also removes the sticky lines</span>
SW1# clear port-security all</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Choosing protect because "it never breaks anything"; it also never tells you about an attack. (2) Reading a huge restrict counter as many attackers; it counts frames, not devices. (3) Expecting aging to clear sticky addresses; it does not, use <code>clear port-security sticky</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> The classic question: "which mode drops frames and increments the violation counter while keeping the port up?" Answer: restrict. Protect drops without counting or logging. Shutdown is the default and is the only mode that err-disables the port.</p></div>

<div class="scn"><h4>The silent protect port</h4><p>A retail chain used violation protect on every store port "to avoid calls". During a security audit, the auditor plugged a laptop behind a POS terminal. The laptop could not talk, which looked good, but the NOC had no log, no counter and no trap, so nobody would ever have known. The fix was to move store ports to restrict, send syslog and SNMP traps to the monitoring system, and alert on any violation count above zero.</p><p><b>Lesson:</b> a security control that leaves no evidence cannot be monitored. Restrict gives the same uptime with visibility.</p></div>

<div class="iv"><p class="q">"Compare the three port security violation modes and tell me which you would use where."</p><p>Strong answer: protect drops unknown MACs silently; restrict drops them, increments the counter per frame and sends syslog/SNMP; shutdown err-disables the port, logs and counts, and is the default. Use shutdown on sensitive fixed ports, restrict where uptime matters but you want evidence, and avoid protect because it hides attacks. Mention that the secure MACs keep working in protect and restrict.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>protect: drop silently. restrict: drop, count, log. shutdown (default): err-disable, count, log.</li>
<li>Secure devices keep working in protect and restrict; shutdown stops the whole port.</li>
<li>The restrict counter increases per dropped frame, not per device.</li>
<li>Aging (absolute or inactivity) expires dynamic addresses, static ones only with aging static; sticky is not aged.</li>
<li>Clear addresses with clear port-security dynamic, sticky or all.</li>
</ul></div>
`,hi:`
<p>Wapas hotel ke darwaze par chalo. Jab koi ajnabi key card try karta hai, hotel teen tareeke se react kar sakta hai. Woh card ko chupchaap ignore kar sakta hai. Woh card mana kar ke front desk par attempt log kar sakta hai. Ya woh darwaza poori tarah lock kar sakta hai jab tak manager aa kar reset na kare. Port security ke paas bilkul yahi teen reactions hain, jinhe <b>violation modes</b> kehte hain: <b>protect</b>, <b>restrict</b> aur <b>shutdown</b>.</p>

<h3>Teen violation modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Galat frames</th><th>Violation counter</th><th>Syslog / SNMP trap</th><th>Port state</th></tr>
<tr><td><b>protect</b></td><td>Drop</td><td>Nahi badhta</td><td>Nahi</td><td>Up rehta hai</td></tr>
<tr><td><b>restrict</b></td><td>Drop</td><td>Har frame par badhta hai</td><td>Haan</td><td>Up rehta hai</td></tr>
<tr><td><b>shutdown</b> (default)</td><td>Port saara traffic rok deta hai</td><td>Badhta hai (1 tak)</td><td>Haan</td><td>err-disabled</td></tr>
</table>
<p>Protect aur restrict mein <b>secure</b> MACs kaam karte rehte hain. Sirf extra, unknown MACs drop hote hain. Shutdown mode mein poora port down ho jaata hai, isliye legitimate device ka connection bhi tab tak chala jaata hai jab tak koi port recover na kare (agla chapter).</p>
<p>Kaise chunein: <b>shutdown</b> high-security ports ke liye jahan koi bhi ajnabi incident hai (reception, ATMs, server rooms). <b>restrict</b> wahan jahan business chalta rehna chahiye lekin aapko saboot bhi chahiye (busy teller desk). <b>protect</b> shaayad hi kabhi achha idea hai, kyunki attack ka koi nishaan nahi bachta.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Violation modes compared">
<rect x="10" y="10" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">protect</text>
<text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="12">ajnabi drop</text><text x="110" y="100" text-anchor="middle" class="svg-muted" font-size="12">counter nahi, log nahi</text><text x="110" y="140" text-anchor="middle" class="svg-accent" font-size="13">port UP</text>
<rect x="220" y="10" width="200" height="170" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">restrict</text>
<text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">ajnabi drop</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">counter +1, syslog</text><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">port UP</text>
<rect x="430" y="10" width="200" height="170" rx="10" fill="#fed7aa"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">shutdown</text>
<text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">poora port rukta hai</text><text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">counter +1, syslog</text><text x="530" y="140" text-anchor="middle" class="svg-accent" font-size="13">err-disabled</text>
</svg><p class="cap">Protect chupchaap hai, restrict saboot rakhta hai, shutdown sab rok deta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Godavari Bank ka teller desk (SW1 Gi0/2) PC2 (0050.7966.0a02) aur ek passbook printer ko serve karta hai. Do devices matlab maximum 2. Customer transaction ke beech desk down nahi ho sakti, isliye mode restrict hai. Agar teesra device aaye, to uske frames drop hote hain, counter badhta hai aur ek syslog message NOC ko batata hai, lekin PC2 aur printer kaam karte rehte hain.</p></div>

<h3>Configuration</h3>
<pre class="code">SW1(config)# interface g0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 2
SW1(config-if)# switchport port-security violation restrict
SW1(config-if)# end</pre>

<h3>Verification: summary table</h3>
<pre class="out">SW1# show port-security
Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
                (Count)       (Count)          (Count)
---------------------------------------------------------------------------
      Gi0/1              1            1                  0         Shutdown
<span class="hl">      Gi0/2              2            2                 37         Restrict</span>
---------------------------------------------------------------------------
Total Addresses in System (excluding one mac per port)     : 1
Max Addresses limit in System (excluding one mac per port) : 4096</pre>
<p>Gi0/2 par 37 violations hain lekin woh abhi bhi forward kar raha hai. Restrict mode mein counter <b>har</b> drop hue frame par badhta hai, isliye bada number matlab 37 alag intruders nahi; ho sakta hai ek hi device ne 37 frames bheje hon. Matching log aisa dikhta hai:</p>
<pre class="out"><span class="hl">%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0bad.0bad.0002 on port GigabitEthernet0/2.</span></pre>
<p>Yahi message shutdown mode mein bhi aata hai, uske baad <code>%PM-4-ERR_DISABLE: psecure-violation error detected on Gi0/1, putting Gi0/1 in err-disable state</code>. Protect mode mein kuch log nahi hota.</p>

<h3>Aging: secure addresses ko expire hone dena</h3>
<p>Default mein secure addresses kabhi age out nahi hote (aging time 0). Yeh fixed desks ke liye theek hai, lekin shared hot-desk ya training room ke liye nahi jahan laptops roz badalte hain. <b>Aging</b> ek timer ke baad secure addresses hata deta hai taaki naye devices bina haath se kuch clear kiye seekhe ja sakein.</p>
<pre class="code">SW1(config-if)# switchport port-security aging time 60          <span class="c">! minutes, 1-1440</span>
SW1(config-if)# switchport port-security aging type inactivity  <span class="c">! ya absolute (default)</span>
SW1(config-if)# switchport port-security aging static           <span class="c">! static entries ko bhi age karo</span></pre>
<ul>
<li><b>absolute</b>: timer khatam hote hi address hat jaata hai, chahe device abhi bhi bol raha ho (phir dobara seekha jaata hai).</li>
<li><b>inactivity</b>: address tabhi hatta hai jab poore timer tak usse koi traffic na dikhe.</li>
<li>Aging <b>dynamic</b> addresses par lagti hai, aur <b>static</b> par sirf <code>aging static</code> ke saath. Sticky addresses age out nahi hote.</li>
</ul>
<pre class="out">SW1# show port-security address
Vlan    Mac Address       Type                          Ports   Remaining Age
----    -----------       ----                          -----   -------------
<span class="hl">   1    0050.7966.0a02    SecureDynamic                 Gi0/2       54</span>
   1    0050.7966.0b07    SecureDynamic                 Gi0/2       60</pre>

<h3>Secure addresses clear karna</h3>
<pre class="code">SW1# clear port-security dynamic interface g0/2
SW1# clear port-security sticky interface g0/1   <span class="c">! sticky lines bhi hata deta hai</span>
SW1# clear port-security all</pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) Protect chunna kyunki "yeh kabhi kuch nahi todta"; yeh attack ke baare mein bhi kabhi nahi batata. (2) Restrict ke bade counter ko bahut saare attackers samajhna; yeh frames ginta hai, devices nahi. (3) Umeed karna ki aging sticky addresses clear karegi; nahi karti, <code>clear port-security sticky</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Classic question: "kaunsa mode frames drop karta hai aur violation counter badhata hai jabki port up rehta hai?" Jawab: restrict. Protect bina gine ya log kiye drop karta hai. Shutdown default hai aur akela mode hai jo port ko err-disable karta hai.</p></div>

<div class="scn"><h4>Chupchaap protect port</h4><p>Ek retail chain har store port par violation protect use karti thi "calls se bachne ke liye". Security audit ke dauraan auditor ne ek POS terminal ke peeche laptop laga diya. Laptop baat nahi kar paya, jo achha laga, lekin NOC ke paas koi log, counter ya trap nahi tha, isliye kisi ko kabhi pata hi nahi chalta. Fix yeh tha ki store ports ko restrict par le jaaya gaya, syslog aur SNMP traps monitoring system ko bheje gaye, aur zero se upar kisi bhi violation count par alert lagaya gaya.</p><p><b>Seekh:</b> jo security control koi saboot nahi chhodta use monitor nahi kiya ja sakta. Restrict wahi uptime visibility ke saath deta hai.</p></div>

<div class="iv"><p class="q">"Teen port security violation modes compare karo aur batao kaunsa kahan use karoge."</p><p>Strong answer: protect unknown MACs ko chupchaap drop karta hai; restrict unhe drop karta hai, har frame par counter badhata hai aur syslog/SNMP bhejta hai; shutdown port ko err-disable karta hai, log aur count karta hai, aur default hai. Sensitive fixed ports par shutdown, jahan uptime zaroori hai par saboot chahiye wahan restrict, aur protect se bacho kyunki woh attacks chhupata hai. Batao ki protect aur restrict mein secure MACs kaam karte rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>protect: chupchaap drop. restrict: drop, count, log. shutdown (default): err-disable, count, log.</li>
<li>Protect aur restrict mein secure devices kaam karte rehte hain; shutdown poora port rok deta hai.</li>
<li>Restrict counter har drop hue frame par badhta hai, har device par nahi.</li>
<li>Aging (absolute ya inactivity) dynamic addresses expire karti hai, static sirf aging static ke saath; sticky age nahi hota.</li>
<li>clear port-security dynamic, sticky ya all se addresses clear karo.</li>
</ul></div>
`}};export{e as default};