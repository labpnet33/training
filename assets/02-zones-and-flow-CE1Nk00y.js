var e={id:`zones-flow`,h:{en:`Zones and the packet flow that leads to a policy decision`,hi:`Zones aur woh packet flow jo policy decision tak le jaata hai`},body:{en:`
<p>A security zone is the unit that PAN-OS policy is built around. You assign each Layer 3 interface to exactly one zone and then write rules <b>from</b> one zone <b>to</b> another. Think of a building: the lobby, the office floor and the server room are zones. Security guards control movement between rooms, and nobody writes rules about individual doors. This makes policy readable and survives hardware changes: replace <code>ethernet1/2</code> with another port, put it in <code>trust</code>, and every rule keeps working.</p>
<h3>How a first packet is processed</h3>
<ol><li>The packet arrives on an interface. The firewall finds its <b>ingress zone</b> from that interface.</li><li>A <b>route lookup</b> on the destination address finds the egress interface and therefore the <b>egress zone</b>.</li><li>The NAT rulebase is evaluated using the pre-NAT zones (covered in the NAT module).</li><li>The security rulebase is searched from the top for the first rule whose zones, addresses, application and service match.</li><li>If allowed, a session is created and later packets follow the session entry without re-reading the rulebase.</li></ol>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="First packet flow"><rect x="20" y="20" width="99" height="74" rx="10" fill="#bae6fd"/><text x="69.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ingress</text><text x="69.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">eth1/2 = trust</text><line x1="122" y1="57" x2="142" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="142,57 136,53 136,61" fill="#64748b"/><rect x="145" y="20" width="99" height="74" rx="10" fill="#bbf7d0"/><text x="194.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Route lookup</text><text x="194.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8 via eth1/1</text><line x1="247" y1="57" x2="267" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="267,57 261,53 261,61" fill="#64748b"/><rect x="270" y="20" width="99" height="74" rx="10" fill="#ddd6fe"/><text x="319.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Egress zone</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">untrust</text><line x1="372" y1="57" x2="392" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="392,57 386,53 386,61" fill="#64748b"/><rect x="395" y="20" width="99" height="74" rx="10" fill="#fde68a"/><text x="444.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rulebase</text><text x="444.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">trust to untrust</text><line x1="497" y1="57" x2="517" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="517,57 511,53 511,61" fill="#64748b"/><rect x="520" y="20" width="99" height="74" rx="10" fill="#fed7aa"/><text x="569.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Session</text><text x="569.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">created</text></svg><p class="cap">The route table decides the destination zone. A wrong route can send traffic to the wrong zone and so to the wrong rule.</p></div>
<h3>The two predefined rules</h3>
<p>Every PAN-OS firewall has two invisible rules at the very bottom of the security rulebase:</p>
<table class="cmp"><tr><th>Rule</th><th>Applies to</th><th>Action</th><th>Logs by default</th></tr><tr><td><code>intrazone-default</code></td><td>traffic with the same source and destination zone</td><td>allow</td><td>no</td></tr><tr><td><code>interzone-default</code></td><td>traffic between different zones</td><td>deny</td><td>no</td></tr></table>
<p>Let us ask the simulator what happens between two hosts of the <b>same</b> zone when no rule mentions them:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to trust source 10.0.1.10 destination 10.0.1.20 protocol 6 destination-port 80
<span class="hl">No rule matched. Traffic falls to the predefined "intrazone-default" rule (action allow).</span></pre>
<p>The firewall answers that the predefined <code>intrazone-default</code> rule allows it. In real PAN-OS you can also see and override these two rules in the web interface to turn on logging, which we cover in the logging chapter.</p>
<div class="note"><p>Do not confuse <b>zone</b> with <b>VLAN</b> or <b>subnet</b>. Two subnets can sit in one zone, and two sub-interfaces of one physical port can sit in different zones.</p></div>
<h3>Check the zones before you write a rule</h3>
<p>In the lab the zone configuration is part of the running configuration. This excerpt of <code>show config running</code> shows the zone and rule parts after the first rule has been committed (we show from the <code>zone</code> block to the end of the security rules):</p>
<pre class="out">admin@NK-PUNE-PA&gt; show config running
zone {
  untrust {
    network {
<span class="hl">      layer3 ethernet1/1;</span>
    }
  }
  trust {
    network {
<span class="hl">      layer3 ethernet1/2;</span>
    }
  }
}
rulebase {
  security {
    rules {
      Allow-Out {
        from trust;
        to untrust;
        source any;
        destination any;
<span class="hl">        application [ ping dns web-browsing ssl ];</span>
        service application-default;
        action allow;
      }
    }
  }</pre>
<div class="eg"><p><b>Worked example.</b> Traffic from PC1 (10.0.1.10) to 8.8.8.8 enters <code>ethernet1/2</code> (zone trust). The route table points 8.8.8.8 to the default route via <code>ethernet1/1</code> (zone untrust). The firewall therefore evaluates rules <b>from trust to untrust</b>. If someone had accidentally put <code>ethernet1/1</code> in zone <code>dmz</code>, the same traffic would be evaluated as trust to dmz and would meet <code>interzone-default</code>.</p></div>
<div class="warn"><p><b>Common mistake.</b> An interface that has an IP address but <b>no zone</b> passes no traffic at all. In the troubleshooting chapter you will see the matching counter, <code>flow_fwd_notopology</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Intrazone traffic is <b>allowed</b> by default, interzone is <b>denied</b>. Candidates mix them up. Also note that a rule with source zone <code>any</code> and destination zone <code>any</code> is "universal" and covers both.</p></div>
<div class="scn"><h4>The new port that never worked</h4><p>A technician connected a new lab VLAN to a spare interface, gave it an IP address and committed. Hosts could ping the firewall but nothing crossed it. The interface had no zone. After <code>set zone lab network layer3 ethernet1/4</code> and a commit the traffic reached the rulebase and met <code>interzone-default</code>; only then could the engineer write the rules the VLAN needed.</p><p><b>Lesson:</b> zone first, rules second. No zone means no policy and no forwarding.</p></div>
<div class="iv"><p class="q">"What happens to traffic between two zones if no security rule matches?"</p><p>It matches the predefined <code>interzone-default</code> rule and is denied silently, with no log unless you override the rule to log. Traffic within one zone matches <code>intrazone-default</code> and is allowed. Add that the egress zone comes from the route lookup, so a wrong route can change which rule applies.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>An interface belongs to one zone; rules are between zones.</li><li>The egress zone comes from the route lookup of the destination.</li><li><code>intrazone-default</code> allows, <code>interzone-default</code> denies; both log nothing by default.</li><li>No zone on an interface means no traffic.</li></ul></div>
`,hi:`
<p>Security zone woh unit hai jiske around PAN-OS policy banti hai. Har Layer 3 interface ko aap ek hi zone mein daalte ho aur phir ek zone <b>se</b> doosre zone <b>tak</b> rules likhte ho. Ek building socho: lobby, office floor aur server room zones hain. Security guards kamron ke beech aana-jaana control karte hain, aur koi individual darwazon ke liye rules nahi likhta. Isse policy padhne layak rehti hai aur hardware badalne par bhi chalti hai: <code>ethernet1/2</code> ko doosre port se badlo, use <code>trust</code> mein daalo, aur har rule chalti rehti hai.</p>
<h3>Pehla packet kaise process hota hai</h3>
<ol><li>Packet ek interface par aata hai. Firewall us interface se <b>ingress zone</b> dhoondta hai.</li><li>Destination address par <b>route lookup</b> egress interface aur isliye <b>egress zone</b> dhoondta hai.</li><li>NAT rulebase pre-NAT zones se evaluate hota hai (NAT module mein padhenge).</li><li>Security rulebase ko upar se search kiya jaata hai us pehli rule ke liye jiske zones, addresses, application aur service match karein.</li><li>Allow ho to session banta hai aur baad ke packets rulebase dobara padhe bina session entry follow karte hain.</li></ol>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="Pehle packet ka flow"><rect x="20" y="20" width="99" height="74" rx="10" fill="#bae6fd"/><text x="69.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ingress</text><text x="69.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">eth1/2 = trust</text><line x1="122" y1="57" x2="142" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="142,57 136,53 136,61" fill="#64748b"/><rect x="145" y="20" width="99" height="74" rx="10" fill="#bbf7d0"/><text x="194.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Route lookup</text><text x="194.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8 via eth1/1</text><line x1="247" y1="57" x2="267" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="267,57 261,53 261,61" fill="#64748b"/><rect x="270" y="20" width="99" height="74" rx="10" fill="#ddd6fe"/><text x="319.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Egress zone</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">untrust</text><line x1="372" y1="57" x2="392" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="392,57 386,53 386,61" fill="#64748b"/><rect x="395" y="20" width="99" height="74" rx="10" fill="#fde68a"/><text x="444.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rulebase</text><text x="444.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">trust to untrust</text><line x1="497" y1="57" x2="517" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="517,57 511,53 511,61" fill="#64748b"/><rect x="520" y="20" width="99" height="74" rx="10" fill="#fed7aa"/><text x="569.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Session</text><text x="569.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">ban gaya</text></svg><p class="cap">Destination zone route table decide karti hai. Galat route traffic ko galat zone aur isliye galat rule tak bhej sakta hai.</p></div>
<h3>Do predefined rules</h3>
<p>Har PAN-OS firewall ke security rulebase ke bilkul neeche do invisible rules hoti hain:</p>
<table class="cmp"><tr><th>Rule</th><th>Kispar lagu</th><th>Action</th><th>Default log</th></tr><tr><td><code>intrazone-default</code></td><td>jab source aur destination zone same ho</td><td>allow</td><td>nahi</td></tr><tr><td><code>interzone-default</code></td><td>alag zones ke beech traffic</td><td>deny</td><td>nahi</td></tr></table>
<p>Simulator se poochte hain ki jab koi rule unka zikr na kare to <b>same</b> zone ke do hosts ke beech kya hota hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to trust source 10.0.1.10 destination 10.0.1.20 protocol 6 destination-port 80
<span class="hl">No rule matched. Traffic falls to the predefined "intrazone-default" rule (action allow).</span></pre>
<p>Firewall batata hai ki predefined <code>intrazone-default</code> rule ise allow karti hai. Asli PAN-OS mein aap web interface mein in dono rules ko dekh aur override bhi kar sakte ho, taaki logging on ho; yeh hum logging chapter mein dekhenge.</p>
<div class="note"><p><b>Zone</b> ko <b>VLAN</b> ya <b>subnet</b> se mat milao. Do subnets ek zone mein ho sakte hain, aur ek physical port ke do sub-interfaces alag zones mein ho sakte hain.</p></div>
<h3>Rule likhne se pehle zones check karo</h3>
<p>Lab mein zone configuration running configuration ka hissa hai. <code>show config running</code> ka yeh excerpt pehli rule commit hone ke baad zone aur rule wale hisse dikhata hai (<code>zone</code> block se security rules ke end tak dikhaya hai):</p>
<pre class="out">admin@NK-PUNE-PA&gt; show config running
zone {
  untrust {
    network {
<span class="hl">      layer3 ethernet1/1;</span>
    }
  }
  trust {
    network {
<span class="hl">      layer3 ethernet1/2;</span>
    }
  }
}
rulebase {
  security {
    rules {
      Allow-Out {
        from trust;
        to untrust;
        source any;
        destination any;
<span class="hl">        application [ ping dns web-browsing ssl ];</span>
        service application-default;
        action allow;
      }
    }
  }</pre>
<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) se 8.8.8.8 ka traffic <code>ethernet1/2</code> (zone trust) par aata hai. Route table 8.8.8.8 ko <code>ethernet1/1</code> (zone untrust) ke default route par point karti hai. Isliye firewall rules <b>from trust to untrust</b> evaluate karta hai. Agar kisi ne galti se <code>ethernet1/1</code> ko zone <code>dmz</code> mein daal diya hota to wahi traffic trust to dmz evaluate hota aur <code>interzone-default</code> se takrata.</p></div>
<div class="warn"><p><b>Common mistake.</b> Jis interface par IP address ho lekin <b>zone na ho</b> woh koi traffic pass nahi karta. Troubleshooting chapter mein aap iska counter <code>flow_fwd_notopology</code> dekhoge.</p></div>
<div class="exam"><p><b>Exam trap.</b> Intrazone traffic default se <b>allowed</b> hai, interzone <b>denied</b>. Candidates inhe ulta kar dete hain. Yeh bhi yaad rakho ki source zone <code>any</code> aur destination zone <code>any</code> wali rule "universal" hai aur dono ko cover karti hai.</p></div>
<div class="scn"><h4>Naya port jo kabhi chala hi nahi</h4><p>Ek technician ne naya lab VLAN spare interface se jodha, IP address diya aur commit kiya. Hosts firewall ko ping kar sakte the lekin kuch bhi paar nahi hota tha. Interface ka koi zone nahi tha. <code>set zone lab network layer3 ethernet1/4</code> aur commit ke baad traffic rulebase tak pahuncha aur <code>interzone-default</code> se takraya; tabhi engineer woh rules likh paaya jo VLAN ko chahiye the.</p><p><b>Lesson:</b> pehle zone, phir rules. Zone nahi to policy nahi aur forwarding nahi.</p></div>
<div class="iv"><p class="q">"Do zones ke beech traffic ko koi security rule match na kare to kya hota hai?"</p><p>Yeh predefined <code>interzone-default</code> rule se match hoti hai aur chupchaap deny ho jaati hai, log nahi hota jab tak rule override karke log on na karo. Ek zone ke andar ka traffic <code>intrazone-default</code> se match hota hai aur allow hota hai. Yeh jodo ki egress zone route lookup se aata hai, isliye galat route lagu hone wali rule badal sakta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Interface ek zone ka hota hai; rules zones ke beech hoti hain.</li><li>Egress zone destination ke route lookup se aata hai.</li><li><code>intrazone-default</code> allow karti hai, <code>interzone-default</code> deny; dono default se kuch log nahi karti.</li><li>Interface par zone nahi to traffic nahi.</li></ul></div>
`}};export{e as default};