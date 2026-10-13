var e={id:`push-check-diff`,h:{en:`Pushing a template with ios_config and previewing with --check --diff`,hi:`ios_config se template push karna aur --check --diff se preview`},body:{en:`
<p><b>One idea in this chapter:</b> after rendering, you send the text to the router with <code>cisco.ios.ios_config</code>, and you always look at a preview first. The safe loop is <b>render, review, check, apply, verify</b>.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Render, review, check, apply, verify">
<rect x="10" y="40" width="108" height="50" rx="10" fill="#fde68a"/><text x="64" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Render</text>
<rect x="136" y="40" width="108" height="50" rx="10" fill="#bae6fd"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Review</text>
<rect x="262" y="40" width="108" height="50" rx="10" fill="#ddd6fe"/><text x="316" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 --check</text>
<rect x="388" y="40" width="108" height="50" rx="10" fill="#bbf7d0"/><text x="442" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Apply</text>
<rect x="514" y="40" width="116" height="50" rx="10" fill="#fed7aa"/><text x="572" y="70" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text>
<line x1="118" y1="65" x2="136" y2="65" stroke="#64748b" stroke-width="2"/><line x1="244" y1="65" x2="262" y2="65" stroke="#64748b" stroke-width="2"/><line x1="370" y1="65" x2="388" y2="65" stroke="#64748b" stroke-width="2"/><line x1="496" y1="65" x2="514" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Nothing reaches a device until step 4.</p></div>

<h3>What ios_config does</h3>
<p>The module logs in to the router, reads the running configuration, and compares it with the lines you give it. Lines already present are skipped. Missing lines are typed in configuration mode. Because of this comparison, running the task twice changes nothing the second time (idempotency). Two ways to give it lines:</p>
<pre class="code"><span class="c"># a few lines, written in the playbook</span>
- cisco.ios.ios_config:
    lines:
      - ntp server 10.99.0.60
      - logging host 10.99.0.60

<span class="c"># a whole rendered template</span>
- cisco.ios.ios_config:
    src: base.j2                 <span class="c"># Jinja2 is rendered with this host's variables</span>
    save_when: modified          <span class="c"># write memory only if something changed</span></pre>
<p>With <code>src</code> the module renders the template itself, so the playbook in this module pushes the same <code>base.j2</code> that it also renders to a file for review. Indented lines such as <code> ip address ...</code> are treated as children of the unindented line above them (<code>interface Loopback0</code>). To place a few lines under a specific parent without a template, add <code>parents: interface Loopback0</code>.</p>
<p><code>save_when: modified</code> copies running-config to startup-config only when this task changed something. Use it on every config task, so a no-change run does not write flash.</p>

<h3>Step 1 to 4 in the lab</h3>
<p>We append the push task to <code>render.yml</code> and run it:</p>
<pre class="code">    - name: Push the config
      cisco.ios.ios_config:
        src: base.j2
        save_when: modified</pre>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook render.yml
...
TASK [Push the config] ********************************************************
<span class="hl">changed: [pun-core-r1]
changed: [blr-edge-r2]</span>

PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
blr-edge-r2                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>The Loopback0 lines and the NTP and syslog lines were missing, so they were sent. Run it again and every task reports ok:</p>
<pre class="out">TASK [Push the config] ********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]</pre>

<h3>Preview with --check --diff</h3>
<p>The NOC wants a second NTP server, <code>10.99.0.61</code>. Edit the variable in <code>group_vars/all.yml</code> (<code>ntp_servers: [10.99.0.60, 10.99.0.61]</code>) and rehearse:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook render.yml --check --diff
...
TASK [Push the config] ********************************************************
--- before: running-config
+++ after: running-config
@@ -55,4 +55,5 @@
  login local
  transport input ssh
 !
<span class="hl">+ntp server 10.99.0.61</span>
 end
changed: [pun-core-r1]
--- before: running-config
+++ after: running-config
@@ -55,4 +55,5 @@
  login local
  transport input ssh
 !
<span class="hl">+ntp server 10.99.0.61</span>
 end
changed: [blr-edge-r2]</pre>
<p><code>--check</code> sends nothing to the router. <code>--diff</code> prints a unified diff: lines with a plus would be added, lines with a minus removed, lines with a space are unchanged context. Exactly one new line per router, as intended. Paste this into the change ticket as the implementation plan. When the plan is approved, run without the flags, then verify on the device:</p>
<pre class="out">R1# show running-config | include ntp
ntp server 10.99.0.60
ntp server 10.99.0.61
R1# show startup-config | include ntp
ntp server 10.99.0.60
<span class="hl">ntp server 10.99.0.61</span></pre>
<p>The startup-config also has the line, so <code>save_when: modified</code> worked.</p>

<h3>Limits of check mode</h3>
<ul>
<li>Check mode is a prediction from the current running-config. If the device changes between the check and the run, the result can differ.</li>
<li>A task that depends on the result of an earlier task (for example one that reads the device and loops over what it found) may show less in check mode, because the earlier task did not really run.</li>
<li>ios_config only <b>adds</b> lines. It never removes the old NTP server for you. Removing is chapter 8.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Running the real playbook without a check first; leaving <code>save_when</code> out, so the new config vanishes at the next reload; expecting ios_config to delete lines that are no longer in the template.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>--check</code> is a dry run; <code>--diff</code> shows the difference; they are separate flags and are normally used together. <code>save_when: modified</code> saves only after a change; <code>always</code> saves every run.</p></div>

<div class="scn"><h4>The change ticket that contained its own proof</h4><p>A bank's change board refused text descriptions of automation changes. The team attached the <code>--check --diff</code> output: one added NTP line on each of two routers. The board approved in minutes. During the window the real run produced the same two lines and nothing else, matching the ticket.</p><p><b>Lesson:</b> a diff is both the plan and the evidence.</p></div>

<div class="iv"><p class="q">"How do you make sure an Ansible config change does only what you expect?"</p><p>Render and read the files, run with --check --diff to see the exact lines that would change, apply, then verify with show commands and a second run that reports no change. Mention save_when: modified and that ios_config adds but does not remove.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ios_config compares your lines with running-config and sends only the missing ones.</li>
<li>src pushes a whole Jinja2 template, rendered with the host's variables.</li>
<li>save_when: modified writes startup-config only after a real change.</li>
<li>--check --diff is the rehearsal; keep its output in the ticket.</li>
<li>ios_config adds lines; it does not remove old ones.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> render ke baad aap text ko <code>cisco.ios.ios_config</code> se router par bhejte ho, aur hamesha pehle preview dekhte ho. Surakshit loop hai <b>render, review, check, apply, verify</b>.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Render, review, check, apply, verify">
<rect x="10" y="40" width="108" height="50" rx="10" fill="#fde68a"/><text x="64" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 Render</text>
<rect x="136" y="40" width="108" height="50" rx="10" fill="#bae6fd"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 Review</text>
<rect x="262" y="40" width="108" height="50" rx="10" fill="#ddd6fe"/><text x="316" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 --check</text>
<rect x="388" y="40" width="108" height="50" rx="10" fill="#bbf7d0"/><text x="442" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 Apply</text>
<rect x="514" y="40" width="116" height="50" rx="10" fill="#fed7aa"/><text x="572" y="70" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text>
<line x1="118" y1="65" x2="136" y2="65" stroke="#64748b" stroke-width="2"/><line x1="244" y1="65" x2="262" y2="65" stroke="#64748b" stroke-width="2"/><line x1="370" y1="65" x2="388" y2="65" stroke="#64748b" stroke-width="2"/><line x1="496" y1="65" x2="514" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Step 4 se pehle device tak kuch nahi pahunchta.</p></div>

<h3>ios_config kya karta hai</h3>
<p>Module router mein login karta hai, running configuration padhta hai, aur use aapki di hui lines se milata hai. Jo lines pehle se hain woh skip hoti hain. Gaayab lines configuration mode mein type hoti hain. Is comparison ki wajah se task do baar chalane par doosri baar kuch nahi badalta (idempotency). Lines dene ke do tareeke:</p>
<pre class="code"><span class="c"># kuch lines, playbook mein likhi hui</span>
- cisco.ios.ios_config:
    lines:
      - ntp server 10.99.0.60
      - logging host 10.99.0.60

<span class="c"># poora rendered template</span>
- cisco.ios.ios_config:
    src: base.j2                 <span class="c"># Jinja2 is host ke variables se render hota hai</span>
    save_when: modified          <span class="c"># kuch badle tabhi write memory</span></pre>
<p><code>src</code> ke saath module template khud render karta hai, isliye is module ka playbook wahi <code>base.j2</code> push karta hai jo review ke liye file mein bhi render hota hai. Indented lines jaise <code> ip address ...</code> upar ki unindented line (<code>interface Loopback0</code>) ke children maani jaati hain. Template ke bina kuch lines ek khaas parent ke neeche rakhni ho to <code>parents: interface Loopback0</code> jodo.</p>
<p><code>save_when: modified</code> running-config ko startup-config mein tabhi copy karta hai jab is task ne kuch badla ho. Har config task par use karo, taaki no-change run flash par na likhe.</p>

<h3>Lab mein step 1 se 4</h3>
<p><code>render.yml</code> mein push task jodte hain aur chalate hain:</p>
<pre class="code">    - name: Push the config
      cisco.ios.ios_config:
        src: base.j2
        save_when: modified</pre>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook render.yml
...
TASK [Push the config] ********************************************************
<span class="hl">changed: [pun-core-r1]
changed: [blr-edge-r2]</span>

PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
blr-edge-r2                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Loopback0 ki lines aur NTP aur syslog ki lines gaayab thi, isliye bhej di gayi. Dobara chalao aur har task ok batata hai:</p>
<pre class="out">TASK [Push the config] ********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]</pre>

<h3>--check --diff se preview</h3>
<p>NOC ko doosra NTP server <code>10.99.0.61</code> chahiye. <code>group_vars/all.yml</code> mein variable badlo (<code>ntp_servers: [10.99.0.60, 10.99.0.61]</code>) aur rehearsal karo:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook render.yml --check --diff
...
TASK [Push the config] ********************************************************
--- before: running-config
+++ after: running-config
@@ -55,4 +55,5 @@
  login local
  transport input ssh
 !
<span class="hl">+ntp server 10.99.0.61</span>
 end
changed: [pun-core-r1]
--- before: running-config
+++ after: running-config
@@ -55,4 +55,5 @@
  login local
  transport input ssh
 !
<span class="hl">+ntp server 10.99.0.61</span>
 end
changed: [blr-edge-r2]</pre>
<p><code>--check</code> router ko kuch nahi bhejta. <code>--diff</code> unified diff print karta hai: plus wali lines jodi jaayengi, minus wali hataayi jaayengi, space wali lines unchanged context hain. Har router par theek ek nayi line, jaisa chaaha tha. Ise change ticket mein implementation plan ki tarah daalo. Plan approve hone par flags ke bina chalao, phir device par verify karo:</p>
<pre class="out">R1# show running-config | include ntp
ntp server 10.99.0.60
ntp server 10.99.0.61
R1# show startup-config | include ntp
ntp server 10.99.0.60
<span class="hl">ntp server 10.99.0.61</span></pre>
<p>Startup-config mein bhi line hai, yaani <code>save_when: modified</code> ne kaam kiya.</p>

<h3>Check mode ki seemayein</h3>
<ul>
<li>Check mode current running-config se ek anumaan hai. Check aur run ke beech device badle to nateeja alag ho sakta hai.</li>
<li>Jo task pichhle task ke nateeje par nirbhar hai (jaise woh jo device padhkar jo mila us par loop kare) wo check mode mein kam dikha sakta hai, kyunki pichhla task sach mein chala nahi.</li>
<li>ios_config sirf lines <b>jodta</b> hai. Purana NTP server aapke liye kabhi nahi hatata. Hatana chapter 8 mein hai.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Bina check ke asli playbook chalana; <code>save_when</code> chhod dena, jisse naya config agle reload par ud jaata hai; umeed karna ki ios_config template se hati hui lines delete kar dega.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>--check</code> dry run hai; <code>--diff</code> antar dikhata hai; yeh alag flags hain aur aam taur par saath use hote hain. <code>save_when: modified</code> sirf change ke baad save karta hai; <code>always</code> har run mein save karta hai.</p></div>

<div class="scn"><h4>Change ticket jisme apna saboot tha</h4><p>Ek bank ka change board automation changes ka text description nahi maanta tha. Team ne <code>--check --diff</code> output attach kiya: do routers par ek-ek NTP line jodi gayi. Board ne minutes mein approve kiya. Window ke dauran asli run ne wahi do lines banayi aur kuch nahi, ticket se match karte hue.</p><p><b>Lesson:</b> diff plan bhi hai aur saboot bhi.</p></div>

<div class="iv"><p class="q">"Ansible config change sirf wahi kare jo chaha, yeh kaise pakka karte ho?"</p><p>Files render karke padhte ho, --check --diff se exact lines dekhte ho jo badlengi, apply karte ho, phir show commands aur no-change dikhane wale doosre run se verify karte ho. save_when: modified aur yeh batao ki ios_config jodta hai, hatata nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ios_config aapki lines ko running-config se milata hai aur sirf gaayab lines bhejta hai.</li>
<li>src poora Jinja2 template host ke variables se render karke push karta hai.</li>
<li>save_when: modified sirf asli change ke baad startup-config likhta hai.</li>
<li>--check --diff rehearsal hai; uska output ticket mein rakho.</li>
<li>ios_config lines jodta hai; purani lines nahi hatata.</li>
</ul></div>
`}};export{e as default};