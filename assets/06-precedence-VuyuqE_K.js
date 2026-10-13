var e={id:`precedence`,h:{en:`Variable precedence: who wins when two places set the same name`,hi:`Variable precedence: do jagah same naam set ho to kaun jeetta hai`},body:{en:`
<p>Once variables live in many places, the same name will sooner or later appear twice. Ansible does not stop or warn. It quietly picks one value by a fixed ranking called <b>variable precedence</b>. You do not need to memorise the full official list of about twenty levels. You need the short ladder that covers inventory work, and the habit of <i>testing</i> instead of guessing.</p>

<h3>The short ladder, weakest to strongest</h3>
<ol>
<li><code>group_vars/all</code>: the broadest default.</li>
<li><code>group_vars/&lt;group&gt;</code>: a more specific group beats <code>all</code>.</li>
<li><code>host_vars/&lt;host&gt;</code>: one host beats every group.</li>
<li><code>vars:</code> inside the play: beats everything from the inventory.</li>
<li><code>-e</code> (extra vars) on the command line: beats everything.</li>
</ol>
<p>Think of it as a funnel from broad to narrow. The closer a value is to one specific host or to the moment of the run, the stronger it is.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Precedence ladder from group all up to extra vars">
<rect x="40" y="195" width="560" height="38" rx="6" fill="#e2e8f0"/><text x="320" y="219" text-anchor="middle" class="svg-ink" font-size="13">1. group_vars/all (weakest)</text>
<rect x="80" y="152" width="480" height="38" rx="6" fill="#fde68a"/><text x="320" y="176" text-anchor="middle" class="svg-ink" font-size="13">2. group_vars/pune, bengaluru</text>
<rect x="120" y="109" width="400" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">3. host_vars/pun-core-r1</text>
<rect x="160" y="66" width="320" height="38" rx="6" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">4. vars: in the play</text>
<rect x="200" y="23" width="240" height="38" rx="6" fill="#fca5a5"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">5. -e on the command (strongest)</text>
</svg><p class="cap">Higher on the ladder wins.</p></div>

<h3>Prove it, one step at a time</h3>
<p>We reuse the tiny debug playbook from the last chapter, which prints <code>snmp_contact</code> for every router. The run outputs below keep only the result lines; the PLAY RECAP lines are left out. First, only <code>group_vars/all.yml</code> sets the contact:</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses noc@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses noc@nk.lab"
}</pre>
<p>Now add a line to the Bengaluru group file with <code>echo 'snmp_contact: blr-noc@nk.lab' &gt;&gt; group_vars/bengaluru.yml</code> and run again. The more specific group wins, but only for its own hosts:</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses noc@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses blr-noc@nk.lab"
}</pre>
<p>Next, give only the Pune core router its own value in <code>host_vars/pun-core-r1.yml</code>:</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses core-oncall@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses blr-noc@nk.lab"
}</pre>
<p>Finally, an extra variable on the command line overrides every file for every host:</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml -e snmp_contact=change-window@nk.lab
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses change-window@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses change-window@nk.lab"
}</pre>

<h3>The surprise: vars in the play beat group_vars</h3>
<p>A colleague adds a <code>vars:</code> block to the play "just to test". Look at what happens to the values in the inventory:</p>
<pre class="code">---
- name: Play vars versus group vars
  hosts: routers
  gather_facts: false
  vars:
    snmp_contact: noc@example.com
  tasks:
    - name: Show the contact
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} uses {{ snmp_contact }}"</pre>
<pre class="out">AUTO01$ ansible-playbook prec2.yml
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses noc@example.com"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses noc@example.com"
}</pre>
<p>Both routers now ignore their group and host files, even the host-specific one. The <code>vars:</code> block is stronger than anything in <code>group_vars</code> and <code>host_vars</code>. Adding <code>-e snmp_contact=change-window@nk.lab</code> to this same run still beats the play, and both routers then print <code>change-window@nk.lab</code>.</p>

<h3>Same-level groups</h3>
<p>Reference note (not run in the simulator): when one host sits in two groups of equal rank and both set the same variable, the group that sorts later alphabetically wins unless you set <code>ansible_group_priority</code>. Avoid the problem by giving each variable one natural home.</p>

<h3>A design rule that prevents most surprises</h3>
<p>Put a variable at the <b>lowest level that is true for everyone who needs it</b>, and override only for real exceptions. Keep <code>vars:</code> in plays for values private to that play, such as a temporary loop list, and never for values that describe a device.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Debugging by staring at the YAML. When a value is wrong, run <code>ansible-inventory --host NAME</code> first. It shows the final inventory values, and <code>grep -rn VARIABLE group_vars host_vars</code> shows every file that sets it. Remember that the play's own <code>vars:</code> are not in that output, so also open the playbook.</p></div>
<div class="exam"><p><b>Exam trap.</b> Extra vars (<code>-e</code>) always win. Host beats group. A child group beats <code>all</code>. Play <code>vars:</code> beat inventory variables. If an answer option says "group_vars beats host_vars", it is wrong.</p></div>

<div class="scn"><h4>The contact that would not change</h4><p>The NOC changed its address in <code>group_vars/all.yml</code>, yet every router kept the old one. A grep found the old address hard-coded in a <code>vars:</code> block of the playbook. Removing the block let the group value through at the next run.</p></div>

<div class="iv"><p class="q">"Explain variable precedence in Ansible."</p><p>There is a fixed ranking. For inventory work: group_vars all is weakest, then specific groups, then host_vars, then play vars, and extra vars on the command line are strongest. I do not rely on memory in a live issue; I check <code>ansible-inventory --host</code> and then the playbook.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Precedence ladder: all, group, host, play vars, <code>-e</code>.</li>
<li>Each rung above was proven with a run in the lab.</li>
<li>Play <code>vars:</code> silently override group_vars and host_vars.</li>
<li>Use <code>ansible-inventory --host</code> and <code>grep -rn</code> to find where a value comes from.</li>
<li>Define each variable at the lowest level that is true for everyone.</li>
</ul></div>
`,hi:`
<p>Jab variables kai jagah rehte hain, to same naam der-saver do baar aayega. Ansible rukta nahi aur warning bhi nahi deta. Woh ek fixed ranking se chup-chaap ek value chun leta hai jise <b>variable precedence</b> kehte hain. Aapko official list ke lagbhag bees levels yaad karne ki zaroorat nahi. Aapko inventory ke kaam wali chhoti ladder chahiye, aur andaza lagane ki jagah <i>test</i> karne ki aadat.</p>

<h3>Chhoti ladder, kamzor se taakatwar tak</h3>
<ol>
<li><code>group_vars/all</code>: sabse broad default.</li>
<li><code>group_vars/&lt;group&gt;</code>: zyada specific group <code>all</code> ko harata hai.</li>
<li><code>host_vars/&lt;host&gt;</code>: ek host har group ko harata hai.</li>
<li>Play ke andar <code>vars:</code>: inventory ki har cheez ko harata hai.</li>
<li>Command line par <code>-e</code> (extra vars): sabko harata hai.</li>
</ol>
<p>Ise broad se narrow funnel samjho. Value jitni ek specific host ya run ke pal ke kareeb hai, utni taakatwar.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="group all se extra vars tak precedence ladder">
<rect x="40" y="195" width="560" height="38" rx="6" fill="#e2e8f0"/><text x="320" y="219" text-anchor="middle" class="svg-ink" font-size="13">1. group_vars/all (sabse kamzor)</text>
<rect x="80" y="152" width="480" height="38" rx="6" fill="#fde68a"/><text x="320" y="176" text-anchor="middle" class="svg-ink" font-size="13">2. group_vars/pune, bengaluru</text>
<rect x="120" y="109" width="400" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">3. host_vars/pun-core-r1</text>
<rect x="160" y="66" width="320" height="38" rx="6" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">4. play mein vars:</text>
<rect x="200" y="23" width="240" height="38" rx="6" fill="#fca5a5"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">5. command par -e (sabse taakatwar)</text>
</svg><p class="cap">Ladder par jo upar, wahi jeetta hai.</p></div>

<h3>Ek-ek step karke sabit karo</h3>
<p>Pichhle chapter ka chhota debug playbook dobara use karte hain, jo har router ke liye <code>snmp_contact</code> print karta hai. Neeche ke run outputs mein sirf result lines hain; PLAY RECAP lines hata di gayi hain. Pehle sirf <code>group_vars/all.yml</code> contact set karti hai:</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses noc@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses noc@nk.lab"
}</pre>
<p>Ab Bengaluru group file mein <code>echo 'snmp_contact: blr-noc@nk.lab' &gt;&gt; group_vars/bengaluru.yml</code> se ek line jodo aur dobara chalao. Zyada specific group jeetta hai, par sirf apne hosts ke liye:</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses noc@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses blr-noc@nk.lab"
}</pre>
<p>Agla, sirf Pune core router ko <code>host_vars/pun-core-r1.yml</code> mein uski apni value do:</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses core-oncall@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses blr-noc@nk.lab"
}</pre>
<p>Aakhir mein, command line par extra variable har file ko har host ke liye override karta hai:</p>
<pre class="out">AUTO01$ ansible-playbook prec.yml -e snmp_contact=change-window@nk.lab
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses change-window@nk.lab"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses change-window@nk.lab"
}</pre>

<h3>Surprise: play ke vars group_vars ko harate hain</h3>
<p>Ek colleague "bas test ke liye" play mein <code>vars:</code> block jodta hai. Dekho inventory ki values ka kya hota hai:</p>
<pre class="code">---
- name: Play vars versus group vars
  hosts: routers
  gather_facts: false
  vars:
    snmp_contact: noc@example.com
  tasks:
    - name: Show the contact
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} uses {{ snmp_contact }}"</pre>
<pre class="out">AUTO01$ ansible-playbook prec2.yml
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 uses noc@example.com"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 uses noc@example.com"
}</pre>
<p>Dono routers ab apni group aur host files ignore karte hain, host-specific wali bhi. <code>vars:</code> block <code>group_vars</code> aur <code>host_vars</code> ki har cheez se taakatwar hai. Isi run mein <code>-e snmp_contact=change-window@nk.lab</code> jodo to woh phir bhi play ko harata hai, aur dono routers <code>change-window@nk.lab</code> print karte hain.</p>

<h3>Same-level groups</h3>
<p>Reference note (not run in the simulator): jab ek host barabar rank ke do groups mein ho aur dono same variable set karein, to alphabetically baad wala group jeetta hai jab tak aap <code>ansible_group_priority</code> set na karo. Samasya se bachne ke liye har variable ko ek natural ghar do.</p>

<h3>Design rule jo zyada tar surprises rokta hai</h3>
<p>Variable ko us <b>sabse neeche ke level par rakho jo un sab ke liye sach hai jinhe chahiye</b>, aur sirf asli exceptions ke liye override karo. Plays mein <code>vars:</code> sirf us play ki private values ke liye rakho, jaise temporary loop list, device ko describe karne wali values ke liye kabhi nahi.</p>

<div class="warn"><p><b>Common beginner mistake.</b> YAML ko ghoor kar debug karna. Value galat ho to pehle <code>ansible-inventory --host NAME</code> chalao. Woh final inventory values dikhata hai, aur <code>grep -rn VARIABLE group_vars host_vars</code> har file dikhata hai jo use set karti hai. Yaad rakho play ke apne <code>vars:</code> us output mein nahi hote, isliye playbook bhi kholo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Extra vars (<code>-e</code>) hamesha jeette hain. Host group ko harata hai. Child group <code>all</code> ko harata hai. Play <code>vars:</code> inventory variables ko harate hain. Agar option kahe "group_vars host_vars ko harata hai", to woh galat hai.</p></div>

<div class="scn"><h4>Jo contact badla nahi</h4><p>NOC ne <code>group_vars/all.yml</code> mein apna address badla, phir bhi har router purana wala rakhe raha. Grep ne purana address playbook ke <code>vars:</code> block mein hard-coded dhoondha. Block hatane se agle run par group value aa gayi.</p></div>

<div class="iv"><p class="q">"Ansible mein variable precedence samjhao."</p><p>Ek fixed ranking hai. Inventory ke kaam ke liye: group_vars all sabse kamzor, phir specific groups, phir host_vars, phir play vars, aur command line ke extra vars sabse taakatwar. Live issue mein yaad par nahi chalta; main <code>ansible-inventory --host</code> aur phir playbook check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Precedence ladder: all, group, host, play vars, <code>-e</code>.</li>
<li>Upar ki har rung lab ke run se sabit hui.</li>
<li>Play <code>vars:</code> chup-chaap group_vars aur host_vars ko override karte hain.</li>
<li>Value kahan se aayi, yeh <code>ansible-inventory --host</code> aur <code>grep -rn</code> se dhoondho.</li>
<li>Har variable us sabse neeche ke level par rakho jo sab ke liye sach hai.</li>
</ul></div>
`}};export{e as default};