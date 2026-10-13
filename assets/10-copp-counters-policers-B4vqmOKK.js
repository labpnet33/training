var e={id:`copp-counters-policers`,h:{en:`CoPP troubleshooting: counters, policers and class-default`,hi:`CoPP troubleshooting: counters, policers aur class-default`},body:{en:`
<p>The assistant keeps a tally sheet at her desk: for every visitor type, how many came, how many were let in, how many were sent away. When the CEO complains that the board member never arrived, you do not argue about the rules; you read the tally sheet. It tells you in which row the board member was counted, and whether that row was full. <code>show policy-map control-plane</code> is that tally sheet.</p>

<h3>Reading show policy-map control-plane</h3>
<pre class="out">R1# show policy-map control-plane
 Control Plane

  Service-policy input: COPP

    Class-map: CP-ROUTING (match-all)
      <span class="hl">0 packets, 0 bytes</span>
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name ACL-ROUTING
      police:
          cir 256000 bps, bc 8000 bytes
        conformed 0 packets, 0 bytes; actions:
          transmit
        exceeded 0 packets, 0 bytes; actions:
          transmit
        conformed 0000 bps, exceeded 0000 bps

    Class-map: CP-MGMT (match-all)
      <span class="hl">0 packets, 0 bytes</span>
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name ACL-MGMT
      police:
          cir 128000 bps, bc 4000 bytes
        conformed 0 packets, 0 bytes; actions:
          transmit
        exceeded 0 packets, 0 bytes; actions:
          drop
        conformed 0000 bps, exceeded 0000 bps

    Class-map: class-default (match-any)
      <span class="hl">212 packets, 17840 bytes</span>
      5 minute offered rate 1000 bps, drop rate 1000 bps
      Match: any
      <span class="hl">drop</span>
      212 packets, 17840 bytes</pre>
<p>Three questions answer almost every CoPP ticket:</p>
<ol>
<li><b>Which class is counting the traffic?</b> Here the routing and management classes count zero while class-default counts 212 packets. The traffic you care about is being classified as "everything else".</li>
<li><b>Is that class conforming or exceeding?</b> A class with rising <b>exceeded</b> counters and <code>exceed-action drop</code> is policing too tightly.</li>
<li><b>What does class-default do?</b> Here it is a flat <code>drop</code>, so every classification gap becomes an outage.</li>
</ol>
<p>Generate the traffic you are testing (wait for an OSPF hello, open one SSH session) and run the command twice; the counters that move are the answer.</p>

<h3>Policers that are too tight</h3>
<p>A policer has a committed rate (<code>cir</code>, bits per second) and a burst (<code>bc</code>, bytes). Control-plane traffic is bursty: a BGP session sending a full table, an SNMP walk, an SSH session printing <code>show running-config</code>, a link flap that makes every OSPF neighbour exchange LSAs at once. A rate that looks generous on average can drop the bursts.</p>
<ul>
<li>Symptoms: SSH sessions freeze while printing long output, SNMP walks time out, BGP converges slowly or the hold timer expires under load, OSPF adjacencies reset during flaps.</li>
<li>Evidence: <code>exceeded</code> counters rising in that class; the 5-minute drop rate is above zero.</li>
<li>Fix: raise the rate or the burst, or police in packets per second (<code>police rate 200 pps</code>) where the platform supports it, which suits small control packets better.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Policer conform and exceed">
<line x1="40" y1="180" x2="620" y2="180" stroke="#64748b" stroke-width="2"/><line x1="40" y1="30" x2="40" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="40" y1="120" x2="620" y2="120" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="560" y="112" class="svg-accent" font-size="12">cir</text>
<rect x="80" y="150" width="40" height="30" fill="#bbf7d0"/><rect x="150" y="140" width="40" height="40" fill="#bbf7d0"/>
<rect x="220" y="120" width="40" height="60" fill="#bbf7d0"/><rect x="220" y="60" width="40" height="60" fill="#fed7aa"/>
<rect x="290" y="150" width="40" height="30" fill="#bbf7d0"/>
<rect x="360" y="120" width="40" height="60" fill="#bbf7d0"/><rect x="360" y="40" width="40" height="80" fill="#fed7aa"/>
<rect x="430" y="155" width="40" height="25" fill="#bbf7d0"/>
<text x="240" y="52" text-anchor="middle" class="svg-muted" font-size="12">burst</text><text x="380" y="32" text-anchor="middle" class="svg-muted" font-size="12">flap</text>
<text x="330" y="205" text-anchor="middle" class="svg-ink" font-size="12">Green: conformed. Orange: exceeded (dropped if exceed-action drop)</text>
</svg><p class="cap">Average rate below the cir, but bursts above it are exceeded and may be dropped.</p></div>

<h3>A safe way to deploy and tune CoPP</h3>
<ol>
<li>Build the classes and use <code>conform-action transmit exceed-action transmit</code> everywhere, including class-default. Nothing is dropped, but every class counts.</li>
<li>Watch the counters for days, across busy periods and maintenance windows. Anything significant in class-default means a missing class.</li>
<li>Set the rates above the observed peaks, then change the exceed action to <code>drop</code> for management, ICMP, undesired and default classes.</li>
<li>Keep routing-protocol classes lenient; dropping OSPF or BGP is almost always worse than a slightly busy CPU.</li>
</ol>
<p>On Catalyst 9000 switches CoPP is already on by default as the system policy <code>system-cpp-policy</code>, with predefined classes per CPU queue. You tune its rates instead of building a policy from nothing, and you verify it with the platform <code>show platform hardware fed switch active qos queue stats internal cpu policer</code> command.</p>

<div class="eg"><p><b>Worked example: the numbers.</b> A class for SSH is policed at <code>cir 32000</code> with the default burst. An engineer runs <code>show tech-support</code> over SSH: the router sends many kilobytes per second of output, and the incoming ACKs also rise. The CP-MGMT class shows <code>exceeded 1840 packets</code> in a minute and the session stalls. Raising it to <code>cir 256000</code> with <code>bc 16000</code> makes the exceeded counter stop at zero during the same test, and the session stays smooth.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Removing the service policy to "test" and forgetting to reapply it. Tuning the rate of the wrong class because nobody checked which class is counting. Reading the counters once instead of twice; the absolute numbers are history, the deltas are the present.</p></div>

<div class="exam"><p><b>Exam trap.</b> If the class you expect shows zero packets and class-default is rising, the fault is <b>classification</b> (ACL, class order), not the policer rate. If the class you expect is counting and its exceeded counter rises, the fault is the <b>policer</b>. The exam likes to show one of these two outputs and ask which change fixes it.</p></div>

<div class="scn"><h4>BGP flaps every night at 02:00</h4><p>An Internet edge router lost its eBGP sessions at 02:00 every night, exactly when a backup job copied large files through it and the upstream provider performed route refreshes. <code>show policy-map control-plane</code> showed the BGP class policed at 64 kbps with exceeded counters in the thousands. Keepalives were being dropped along with the update bursts, so the hold timer expired. The class was changed to <code>exceed-action transmit</code> and the rate raised after a baseline; the flaps stopped.</p><p><b>Lesson:</b> never drop routing protocol traffic on a guess. Baseline first.</p></div>

<div class="iv"><p class="q">"After CoPP was deployed, SSH sessions freeze when printing long output. What is happening?"</p><p>Strong answer: the SSH packets are classified correctly, since the session opens, but the management class policer is too tight for bursts. <code>show policy-map control-plane</code> will show the exceeded counter rising in that class while the session stalls. Raise the CIR or burst, or police in packets per second, and re-test. Mention the baseline approach: transmit on exceed first, then tighten.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show policy-map control-plane</code> shows packets per class, conformed and exceeded counters, and class-default.</li>
<li>Zero in the expected class plus rising class-default means a classification error.</li>
<li>Rising exceeded counters in the right class mean the policer is too tight.</li>
<li>Deploy with transmit on exceed, baseline, then tighten; keep routing classes lenient.</li>
<li>Run the show command twice and read the deltas.</li>
</ul></div>
`,hi:`
<p>Assistant apni desk par ek tally sheet rakhti hai: har visitor type ke liye, kitne aaye, kitne andar gaye, kitne wapas bheje gaye. Jab CEO shikayat karta hai ki board member kabhi pahuncha hi nahi, to aap rules par behas nahi karte; aap tally sheet padhte ho. Woh batati hai ki board member kis row mein gina gaya, aur woh row bhari thi ya nahi. <code>show policy-map control-plane</code> wahi tally sheet hai.</p>

<h3>show policy-map control-plane padhna</h3>
<pre class="out">R1# show policy-map control-plane
 Control Plane

  Service-policy input: COPP

    Class-map: CP-ROUTING (match-all)
      <span class="hl">0 packets, 0 bytes</span>
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name ACL-ROUTING
      police:
          cir 256000 bps, bc 8000 bytes
        conformed 0 packets, 0 bytes; actions:
          transmit
        exceeded 0 packets, 0 bytes; actions:
          transmit
        conformed 0000 bps, exceeded 0000 bps

    Class-map: CP-MGMT (match-all)
      <span class="hl">0 packets, 0 bytes</span>
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name ACL-MGMT
      police:
          cir 128000 bps, bc 4000 bytes
        conformed 0 packets, 0 bytes; actions:
          transmit
        exceeded 0 packets, 0 bytes; actions:
          drop
        conformed 0000 bps, exceeded 0000 bps

    Class-map: class-default (match-any)
      <span class="hl">212 packets, 17840 bytes</span>
      5 minute offered rate 1000 bps, drop rate 1000 bps
      Match: any
      <span class="hl">drop</span>
      212 packets, 17840 bytes</pre>
<p>Teen sawaal lagbhag har CoPP ticket ka jawab dete hain:</p>
<ol>
<li><b>Kaunsi class traffic gin rahi hai?</b> Yahan routing aur management classes zero gin rahi hain jabki class-default 212 packets. Jo traffic aapke liye maayne rakhta hai woh "baaki sab" mein classify ho raha hai.</li>
<li><b>Woh class conform kar rahi hai ya exceed?</b> Jis class mein <b>exceeded</b> counters badh rahe hon aur <code>exceed-action drop</code> ho, woh bahut tight police kar rahi hai.</li>
<li><b>Class-default kya karti hai?</b> Yahan yeh seedha <code>drop</code> hai, isliye har classification gap outage ban jaata hai.</li>
</ol>
<p>Jo traffic test kar rahe ho use generate karo (OSPF hello ka intezaar karo, ek SSH session kholo) aur command do baar chalao; jo counters hilte hain wahi jawab hain.</p>

<h3>Bahut tight policers</h3>
<p>Policer ka ek committed rate (<code>cir</code>, bits per second) aur ek burst (<code>bc</code>, bytes) hota hai. Control-plane traffic bursty hota hai: full table bhejta BGP session, SNMP walk, <code>show running-config</code> print karta SSH session, link flap jisse har OSPF neighbour ek saath LSAs exchange kare. Jo rate average mein kaafi lagta hai woh bursts ko drop kar sakta hai.</p>
<ul>
<li>Lakshan: lamba output print karte waqt SSH sessions ruk jaate hain, SNMP walks time out hote hain, BGP dheere converge hota hai ya load mein hold timer expire hota hai, flaps ke dauraan OSPF adjacencies reset hoti hain.</li>
<li>Saboot: us class mein <code>exceeded</code> counters badh rahe hain; 5-minute drop rate zero se upar hai.</li>
<li>Fix: rate ya burst badhao, ya jahan platform support kare wahan packets per second mein police karo (<code>police rate 200 pps</code>), jo chhote control packets ke liye behtar hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Policer conform aur exceed">
<line x1="40" y1="180" x2="620" y2="180" stroke="#64748b" stroke-width="2"/><line x1="40" y1="30" x2="40" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="40" y1="120" x2="620" y2="120" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="560" y="112" class="svg-accent" font-size="12">cir</text>
<rect x="80" y="150" width="40" height="30" fill="#bbf7d0"/><rect x="150" y="140" width="40" height="40" fill="#bbf7d0"/>
<rect x="220" y="120" width="40" height="60" fill="#bbf7d0"/><rect x="220" y="60" width="40" height="60" fill="#fed7aa"/>
<rect x="290" y="150" width="40" height="30" fill="#bbf7d0"/>
<rect x="360" y="120" width="40" height="60" fill="#bbf7d0"/><rect x="360" y="40" width="40" height="80" fill="#fed7aa"/>
<rect x="430" y="155" width="40" height="25" fill="#bbf7d0"/>
<text x="240" y="52" text-anchor="middle" class="svg-muted" font-size="12">burst</text><text x="380" y="32" text-anchor="middle" class="svg-muted" font-size="12">flap</text>
<text x="330" y="205" text-anchor="middle" class="svg-ink" font-size="12">Hara: conformed. Orange: exceeded (exceed-action drop ho to drop)</text>
</svg><p class="cap">Average rate cir se neeche, lekin uske upar ke bursts exceeded hote hain aur drop ho sakte hain.</p></div>

<h3>CoPP deploy aur tune karne ka safe tareeka</h3>
<ol>
<li>Classes banao aur har jagah <code>conform-action transmit exceed-action transmit</code> use karo, class-default samet. Kuch drop nahi hota, lekin har class ginti hai.</li>
<li>Counters ko dino tak dekho, busy periods aur maintenance windows ke paar. Class-default mein kuch bhi significant matlab ek class missing hai.</li>
<li>Rates dekhe gaye peaks se upar set karo, phir management, ICMP, undesired aur default classes ke liye exceed action ko <code>drop</code> karo.</li>
<li>Routing-protocol classes naram rakho; OSPF ya BGP drop karna lagbhag hamesha thode busy CPU se bura hai.</li>
</ol>
<p>Catalyst 9000 switches par CoPP default mein pehle se on hota hai, system policy <code>system-cpp-policy</code> ke roop mein, har CPU queue ke liye predefined classes ke saath. Aap shuru se policy banane ki jagah iske rates tune karte ho, aur platform command <code>show platform hardware fed switch active qos queue stats internal cpu policer</code> se verify karte ho.</p>

<div class="eg"><p><b>Worked example: numbers.</b> SSH ki ek class default burst ke saath <code>cir 32000</code> par policed hai. Ek engineer SSH par <code>show tech-support</code> chalata hai: router har second kai kilobytes output bhejta hai, aur aane wale ACKs bhi badhte hain. CP-MGMT class ek minute mein <code>exceeded 1840 packets</code> dikhati hai aur session atak jaata hai. Ise <code>bc 16000</code> ke saath <code>cir 256000</code> karne se usi test mein exceeded counter zero par ruk jaata hai, aur session smooth rehta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Test" ke liye service policy hatana aur dobara lagana bhool jaana. Galat class ka rate tune karna kyunki kisi ne check nahi kiya ki kaunsi class gin rahi hai. Counters do baar ki jagah ek baar padhna; absolute numbers itihaas hain, deltas vartmaan.</p></div>

<div class="exam"><p><b>Exam trap.</b> Agar ummeed wali class zero packets dikhaye aur class-default badh raha ho, to fault <b>classification</b> (ACL, class order) hai, policer rate nahi. Agar ummeed wali class gin rahi hai aur uska exceeded counter badh raha hai, to fault <b>policer</b> hai. Exam in do mein se ek output dikha kar poochhna pasand karta hai ki kaunsa change fix karega.</p></div>

<div class="scn"><h4>Har raat 02:00 baje BGP flaps</h4><p>Ek Internet edge router har raat 02:00 baje apne eBGP sessions kho deta tha, theek jab ek backup job uske through badi files copy karti thi aur upstream provider route refreshes karta tha. <code>show policy-map control-plane</code> ne BGP class ko 64 kbps par policed dikhaya jiske exceeded counters hazaaron mein the. Update bursts ke saath keepalives bhi drop ho rahe the, isliye hold timer expire ho jaata tha. Class ko <code>exceed-action transmit</code> kiya gaya aur baseline ke baad rate badhaya gaya; flaps ruk gaye.</p><p><b>Seekh:</b> andaze par routing protocol traffic kabhi drop mat karo. Pehle baseline lo.</p></div>

<div class="iv"><p class="q">"CoPP deploy hone ke baad lamba output print karte waqt SSH sessions freeze ho jaate hain. Kya ho raha hai?"</p><p>Strong answer: SSH packets sahi classify ho rahe hain, kyunki session khulta hai, lekin management class ka policer bursts ke liye bahut tight hai. <code>show policy-map control-plane</code> session atakne ke dauraan us class mein exceeded counter badhta dikhayega. CIR ya burst badhao, ya packets per second mein police karo, aur dobara test karo. Baseline approach ka zikr karo: pehle exceed par transmit, phir tight karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show policy-map control-plane</code> har class ke packets, conformed aur exceeded counters, aur class-default dikhata hai.</li>
<li>Ummeed wali class mein zero plus badhta class-default matlab classification error.</li>
<li>Sahi class mein badhte exceeded counters matlab policer bahut tight hai.</li>
<li>Exceed par transmit ke saath deploy karo, baseline lo, phir tight karo; routing classes naram rakho.</li>
<li>Show command do baar chalao aur deltas padho.</li>
</ul></div>
`}};export{e as default};