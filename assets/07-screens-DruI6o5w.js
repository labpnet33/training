var e={id:`screens`,h:{en:`Screens: dropping attacks before policy`,hi:`Screens: policy se pehle attacks drop karna`},body:{en:`<p><b>Analogy.</b> At a stadium gate the guard first checks for obvious trouble (a crowd rushing the gate, a forged ticket) before anyone looks at the seat number. <b>Screens</b> are that first check. They run before the session lookup and before the security policy, so a screened packet never reaches a policy at all.</p>
<h3>What screens look for</h3>
<p>A screen set (an <b>ids-option</b>) lists attack types. Examples: <b>SYN flood</b> (too many TCP SYNs per second), <b>ICMP flood</b>, <b>UDP flood</b>, <b>land attack</b> (source equals destination), <b>ping of death</b> (an oversized ICMP packet), <b>port scan</b> and <b>address sweep</b> (one source probing many ports or hosts), and malformed TCP flag combinations. You build the set, then attach it to the <b>ingress zone</b>.</p>
<pre class="code">set security screen ids-option UNTRUST-SCR tcp syn-flood attack-threshold 100
set security screen ids-option UNTRUST-SCR tcp land
set security screen ids-option UNTRUST-SCR icmp ping-death
set security zones security-zone untrust screen UNTRUST-SCR
commit</pre>
<pre class="out">user@BRANCH-SRX&gt; show security screen statistics zone untrust
Screen statistics:

IDS attack type                              Statistics
  ICMP flood                                 0
  TCP SYN flood                              <span class="hl">200</span>
  ICMP ping of death                         1
  TCP land attack                            0</pre>
<p>The simulator prints a subset of the real rows. Its rate screens use one-second windows of simulated time, and port scan and address sweep are simplified to "more than ten distinct ports or hosts from one source in one second".</p>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Screen before session and policy"><rect x="10" y="45" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="13">packet in</text><rect x="150" y="45" width="130" height="50" rx="8" fill="#fecaca"/><text x="215" y="75" text-anchor="middle" class="svg-ink" font-size="13">1. screens</text><rect x="310" y="45" width="130" height="50" rx="8" fill="#fde68a"/><text x="375" y="75" text-anchor="middle" class="svg-ink" font-size="13">2. session</text><rect x="470" y="45" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="75" text-anchor="middle" class="svg-ink" font-size="13">3. policy</text><path d="M120 70H150M280 70H310M440 70H470" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Screens come first. A drop here never touches policy.</p></div>
<div class="eg"><p><b>Worked example.</b> A test host sends 300 SYNs in one second to the branch with an attack threshold of 100. The first 100 are allowed, the next 200 are dropped, and the counter reads 200. A real attacker's flood is therefore absorbed at the edge instead of reaching your servers.</p></div>
<div class="warn"><p><b>Common mistake.</b> Setting a threshold below normal peak traffic. A busy web server or a monitoring system can then be dropped as "attackers". Measure normal rates first, set the threshold above them, and consider <code>alarm-without-drop</code> while tuning.</p></div>
<div class="exam"><p><b>Exam trap.</b> Screens are applied per <i>zone</i> (the ingress zone) and act before the policy. They protect the firewall too: a flood addressed to the SRX itself is also screened.</p></div>
<div class="scn"><h4>Legitimate users dropped</h4><p>After a marketing email thousands of customers hit the site and some got errors. The SYN flood threshold was 100 per second. Screen statistics showed the counter rising during the campaign. Raising the threshold to match real peaks restored service, and alarm-without-drop was used for a week to confirm.</p><p><b>Lesson:</b> a screen that is too tight is an outage you configured.</p></div>
<div class="iv"><p class="q">"Where do screens act, and how do you verify them?"</p><p>On the ingress zone, before session lookup and policy. I verify with show security screen statistics zone and by generating test traffic, and I tune thresholds to real traffic patterns.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Screens run before sessions and policies.</li><li>Attach an ids-option to the ingress zone.</li><li>Read show security screen statistics zone.</li><li>Tune thresholds; use alarm-without-drop to learn.</li></ul></div>`,hi:`<p><b>Analogy.</b> Stadium gate par guard pehle saaf dikhne wali pareshani check karta hai (gate par bheed ka daudna, jaali ticket) uske baad hi koi seat number dekhta hai. <b>Screens</b> wahi pehli jaanch hain. Yeh session lookup aur security policy se pehle chalti hain, isliye screened packet kisi policy tak pahunchta hi nahi.</p>
<h3>Screens kya dhoondti hain</h3>
<p>Screen set (ek <b>ids-option</b>) attack types ki list rakhta hai. Examples: <b>SYN flood</b> (ek second mein bahut saare TCP SYN), <b>ICMP flood</b>, <b>UDP flood</b>, <b>land attack</b> (source aur destination same), <b>ping of death</b> (bahut bada ICMP packet), <b>port scan</b> aur <b>address sweep</b> (ek source kai ports ya hosts ko probe kare), aur galat TCP flag combinations. Aap set banate ho, phir use <b>ingress zone</b> par lagate ho.</p>
<pre class="code">set security screen ids-option UNTRUST-SCR tcp syn-flood attack-threshold 100
set security screen ids-option UNTRUST-SCR tcp land
set security screen ids-option UNTRUST-SCR icmp ping-death
set security zones security-zone untrust screen UNTRUST-SCR
commit</pre>
<pre class="out">user@BRANCH-SRX&gt; show security screen statistics zone untrust
Screen statistics:

IDS attack type                              Statistics
  ICMP flood                                 0
  TCP SYN flood                              <span class="hl">200</span>
  ICMP ping of death                         1
  TCP land attack                            0</pre>
<p>Simulator real rows ka subset print karta hai. Uski rate screens simulated time ki ek-second windows use karti hain, aur port scan aur address sweep "ek source se ek second mein das se zyada alag ports ya hosts" tak simplified hain.</p>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Session aur policy se pehle screen"><rect x="10" y="45" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="13">packet in</text><rect x="150" y="45" width="130" height="50" rx="8" fill="#fecaca"/><text x="215" y="75" text-anchor="middle" class="svg-ink" font-size="13">1. screens</text><rect x="310" y="45" width="130" height="50" rx="8" fill="#fde68a"/><text x="375" y="75" text-anchor="middle" class="svg-ink" font-size="13">2. session</text><rect x="470" y="45" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="75" text-anchor="middle" class="svg-ink" font-size="13">3. policy</text><path d="M120 70H150M280 70H310M440 70H470" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Screens pehle aati hain. Yahan ka drop policy ko chhuta bhi nahi.</p></div>
<div class="eg"><p><b>Worked example.</b> Ek test host attack threshold 100 ke saath branch ko ek second mein 300 SYN bhejta hai. Pehle 100 allowed, agle 200 dropped, aur counter 200 padhta hai. Asli attacker ka flood is tarah edge par hi absorb ho jata hai, aapke servers tak nahi pahunchta.</p></div>
<div class="warn"><p><b>Common mistake.</b> Threshold normal peak traffic se neeche rakhna. Tab busy web server ya monitoring system ko "attacker" samajhkar drop kiya ja sakta hai. Pehle normal rates naapo, threshold unse upar rakho, aur tuning ke dauran <code>alarm-without-drop</code> sochho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Screens <i>zone</i> (ingress zone) par lagti hain aur policy se pehle kaam karti hain. Yeh firewall ko bhi bachati hain: SRX ko addressed flood bhi screen hota hai.</p></div>
<div class="scn"><h4>Legitimate users drop ho gaye</h4><p>Marketing email ke baad hazaron customers site par aaye aur kuch ko errors mile. SYN flood threshold 100 per second tha. Screen statistics ne campaign ke dauran counter badhta dikhaya. Threshold ko real peaks ke hisaab se badhane se service wapas aayi, aur confirm karne ke liye ek hafte alarm-without-drop use hua.</p><p><b>Lesson:</b> bahut tight screen aapka configure kiya hua outage hai.</p></div>
<div class="iv"><p class="q">"Screens kahan kaam karti hain, aur unhe verify kaise karte ho?"</p><p>Ingress zone par, session lookup aur policy se pehle. Main show security screen statistics zone aur test traffic generate karke verify karta hoon, aur thresholds ko real traffic patterns ke hisaab se tune karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Screens sessions aur policies se pehle chalti hain.</li><li>ids-option ko ingress zone par lagao.</li><li>show security screen statistics zone padho.</li><li>Thresholds tune karo; seekhne ke liye alarm-without-drop use karo.</li></ul></div>`}};export{e as default};