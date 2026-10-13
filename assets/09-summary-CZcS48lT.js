var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the full MPLS picture for JNCIS-SP: what labels are, how LDP and RSVP build LSPs, how Junos resolves traffic into them, and how to find faults. Use this chapter as a last-week revision sheet.</p>
<h3>Can-do checklist</h3>
<ul><li>Explain ingress, transit, egress, LER, LSR, LSP and FEC.</li><li>Describe push, swap, pop, PHP, implicit null (3) and explicit null (0).</li><li>Enable MPLS on an interface: family mpls, protocols mpls, plus LDP or RSVP.</li><li>Describe LDP discovery and session ports, the transport address and the default loopback-only labels.</li><li>Describe RSVP Path and Resv, CSPF, the TED, ERO and soft state.</li><li>Explain inet.3, mpls.0 and BGP next-hop resolution order.</li><li>Configure strict and loose explicit paths, primary, secondary and standby.</li><li>Troubleshoot bottom-up.</li></ul>
<h3>Mini glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr><tr><td>LSP</td><td>One-way label-switched path</td></tr><tr><td>FEC</td><td>Packets that share one LSP treatment</td></tr><tr><td>PHP</td><td>Penultimate hop popping: the router before the egress removes the label</td></tr><tr><td>ERO</td><td>Explicit Route Object, the hop list in an RSVP Path message</td></tr><tr><td>CSPF</td><td>SPF over the TED with constraints</td></tr><tr><td>TED</td><td>Traffic engineering database fed by the IGP</td></tr></table>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr><tr><td>Shim header size</td><td>32 bits (20 + 3 + 1 + 8)</td></tr><tr><td>Implicit null / explicit null</td><td>3 / 0</td></tr><tr><td>LDP ports</td><td>UDP 646 discovery (224.0.0.2), TCP 646 session</td></tr><tr><td>Preference in inet.3</td><td>RSVP 7, LDP 9</td></tr><tr><td>LDP labels by default</td><td>Loopback /32 only</td></tr><tr><td>BGP next-hop lookup</td><td>inet.3 first, then inet.0</td></tr><tr><td>Strongest priority</td><td>0</td></tr></table>
<h3>Command cheat sheet (real router)</h3>
<pre class="code"><span class="c">! Reference commands (not available in the simulator)</span>
show ldp neighbor
show ldp session
show ldp database
show rsvp session
show mpls lsp
show route table inet.3
show route table mpls.0
ping mpls ldp 10.0.0.2
traceroute 10.0.0.2</pre>
<p>For hands-on IGP practice return to jncis-ospf, jncis-isis and jncissp-isis. For BGP use jncis-bgp. For LDP on another platform use spcor-mpls-ldp.</p>
<div class="warn"><p><b>Common mistake.</b> Memorising commands without understanding the order of layers. The exam tests reasoning: why a label is missing, why a path is rejected.</p></div>
<div class="exam"><p><b>Exam trap.</b> Watch wording: "LDP routes" go to inet.3, "RSVP routes" too; neither goes to inet.0 by default. Preference numbers 7 and 9 are easy marks.</p></div>
<div class="scn"><h4>Exam day recall</h4><p>A candidate faced a question about which table a BGP route resolves in first. Remembering the picture of the BGP route, inet.3, then forwarding with a label push gave the right answer, inet.3 first, then inet.0.</p><p><b>Lesson:</b> Pictures beat lists; redraw the diagrams from memory.</p></div>
<div class="iv"><p class="q">"Walk me through an MPLS network in two minutes."</p><p>IGP builds the topology. LDP or RSVP builds LSPs between PE loopbacks. The ingress pushes a label, transit routers swap using mpls.0, the penultimate hop pops, and the egress forwards IP. BGP resolves next hops in inet.3, so customer routes ride the LSP and the core stays BGP-free. RSVP adds traffic engineering and fast reroute.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Know the labels, operations, tables and protocol differences.</li><li>Prove layers bottom-up.</li><li>The simulator has no MPLS labs; use the related modules for the IGP and BGP skills.</li><li>Redraw the diagrams from memory before the exam.</li></ul></div>
`,hi:`
<p>Ab aapke paas JNCIS-SP ke liye poori MPLS tasveer hai: labels kya hain, LDP aur RSVP LSPs kaise banate hain, Junos traffic ko unmein kaise resolve karta hai, aur faults kaise dhoondhte hain. Is chapter ko aakhri hafte ki revision sheet ki tarah use karo.</p>
<h3>Can-do checklist</h3>
<ul><li>Ingress, transit, egress, LER, LSR, LSP aur FEC samjha sakte ho.</li><li>Push, swap, pop, PHP, implicit null (3) aur explicit null (0) describe kar sakte ho.</li><li>Interface par MPLS enable kar sakte ho: family mpls, protocols mpls, saath mein LDP ya RSVP.</li><li>LDP discovery aur session ports, transport address aur default loopback-only labels describe kar sakte ho.</li><li>RSVP Path aur Resv, CSPF, TED, ERO aur soft state describe kar sakte ho.</li><li>inet.3, mpls.0 aur BGP next-hop resolution order samjha sakte ho.</li><li>Strict aur loose explicit paths, primary, secondary aur standby configure kar sakte ho.</li><li>Bottom-up troubleshoot kar sakte ho.</li></ul>
<h3>Mini glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr><tr><td>LSP</td><td>One-way label-switched path</td></tr><tr><td>FEC</td><td>Packets jo ek LSP treatment share karte hain</td></tr><tr><td>PHP</td><td>Penultimate hop popping: egress se pehle wala router label hatata hai</td></tr><tr><td>ERO</td><td>Explicit Route Object, RSVP Path message ka hop list</td></tr><tr><td>CSPF</td><td>Constraints ke saath TED par SPF</td></tr><tr><td>TED</td><td>IGP se bharne wala traffic engineering database</td></tr></table>
<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr><tr><td>Shim header size</td><td>32 bits (20 + 3 + 1 + 8)</td></tr><tr><td>Implicit null / explicit null</td><td>3 / 0</td></tr><tr><td>LDP ports</td><td>UDP 646 discovery (224.0.0.2), TCP 646 session</td></tr><tr><td>inet.3 mein preference</td><td>RSVP 7, LDP 9</td></tr><tr><td>LDP default labels</td><td>Sirf loopback /32</td></tr><tr><td>BGP next-hop lookup</td><td>Pehle inet.3, phir inet.0</td></tr><tr><td>Sabse strong priority</td><td>0</td></tr></table>
<h3>Command cheat sheet (real router)</h3>
<pre class="code"><span class="c">! Reference commands (not available in the simulator)</span>
show ldp neighbor
show ldp session
show ldp database
show rsvp session
show mpls lsp
show route table inet.3
show route table mpls.0
ping mpls ldp 10.0.0.2
traceroute 10.0.0.2</pre>
<p>Hands-on IGP practice ke liye jncis-ospf, jncis-isis aur jncissp-isis par wapas jao. BGP ke liye jncis-bgp. Doosre platform par LDP ke liye spcor-mpls-ldp.</p>
<div class="warn"><p><b>Common mistake.</b> Order of layers samjhe bina commands ratna. Exam reasoning test karta hai: label kyun missing hai, path kyun reject hua.</p></div>
<div class="exam"><p><b>Exam trap.</b> Wording dekho: "LDP routes" inet.3 mein jaate hain, "RSVP routes" bhi; default mein koi inet.0 mein nahi. Preference numbers 7 aur 9 aasaan marks hain.</p></div>
<div class="scn"><h4>Exam din ki recall</h4><p>Ek candidate ke saamne sawal aaya ki BGP route pehle kis table mein resolve hota hai. BGP route, inet.3, phir label push ke saath forwarding wali tasveer yaad karne se sahi jawab mila, pehle inet.3, phir inet.0.</p><p><b>Lesson:</b> Tasveerein lists se behtar hain; diagrams yaad se dobara banao.</p></div>
<div class="iv"><p class="q">"Mujhe do minute mein MPLS network samjhao."</p><p>IGP topology banata hai. LDP ya RSVP PE loopbacks ke beech LSPs banate hain. Ingress label push karta hai, transit routers mpls.0 se swap karte hain, penultimate hop pop karta hai, aur egress IP forward karta hai. BGP next hops inet.3 mein resolve karta hai, isliye customer routes LSP par chalte hain aur core BGP-free rehta hai. RSVP traffic engineering aur fast reroute jodta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Labels, operations, tables aur protocol differences jaano.</li><li>Layers neeche se upar saabit karo.</li><li>Simulator mein MPLS labs nahi hain; IGP aur BGP skills ke liye related modules use karo.</li><li>Exam se pehle diagrams yaad se dobara banao.</li></ul></div>
`}};export{e as default};