var e={id:`troubleshooting`,h:{en:`Troubleshooting a red pipeline: the Lab 2 walk-through`,hi:`Red pipeline ka troubleshooting: Lab 2 walk-through`},body:{en:`

<p><b>One idea in this chapter:</b> a red pipeline is not a disaster. It is the system doing its job. Find the <b>first</b> red job, read its log from the bottom, fix one thing, push again. Lab 2 gives you two different mistakes to practise on.</p>

<h3>The method</h3>
<ul><li><b>1. Status:</b> run <code>ci status</code> and find the first job that is not green. Skipped jobs below it are innocent.</li><li><b>2. Log:</b> run <code>ci log JOB</code> and read the last lines first. The error is almost always at the end.</li><li><b>3. Reproduce:</b> run the same command on your laptop (<code>yamllint vlans.yml</code>, <code>python3 check.py</code>) so you can fix without waiting for a pipeline.</li><li><b>4. Fix one thing</b>, commit with a clear message, push.</li><li><b>5. Read the new pipeline.</b> A second problem often hides behind the first.</li></ul>

<h3>Scene: store 14, Indore, wants guest Wi-Fi</h3>
<p>A colleague added a fourth VLAN to <code>vlans.yml</code> and pushed. The pipeline is red:</p>
<pre class="code">ci status</pre>
<pre class="out">Pipeline #101 <span class="hl">failed</span> on main (7d546f7)
  validate   lint               <span class="hl">failed</span>
  test       unit-test          skipped
  deploy     push-vlans         skipped</pre>
<p>The first red job is <b>lint</b>. The two below it are skipped, which is correct: nothing after a failure runs. Open the lint log:</p>
<pre class="code">ci log lint</pre>
<pre class="out">Job "lint" (failed)
Running with nk-runner 17.x on shell executor
$ git checkout 7d546f7
$ yamllint vlans.yml
<span class="hl">vlans.yml:8:4: error: bad indentation of a sequence entry (this line is indented more than the list item above it)</span>
ERROR: Job failed: command "yamllint vlans.yml" exited with a non-zero status</pre>
<p>The message gives the file, line 8 and column 4. Print the file with line numbers:</p>
<pre class="code">nl vlans.yml</pre>
<pre class="out">     1  # VLANs for Narmada Retail - store 14, Indore
     2  vlans:
     3    - id: 10
     4      name: POS
     5    - id: 20
     6      name: STAFF
     7    - id: 4100
     8     name: GUEST-WIFI</pre>
<p>Look at lines 7 and 8. The key <code>name</code> on line 8 should line up with <code>id</code> on line 7, but it has one space too few. Fix line 8 (four spaces before name) and check locally:</p>
<pre class="code">edit vlans.yml 8     name: GUEST-WIFI
yamllint vlans.yml</pre>
<pre class="out">     8      name: GUEST-WIFI
vlans.yml: <span class="hl">valid YAML</span> (mapping with keys: vlans)</pre>
<pre class="code">git commit -am "Fix YAML indentation"
git push origin main</pre>
<pre class="out">[main 6b0032d] Fix YAML indentation
 1 file changed
remote: Pipeline #102 created for main (6b0032d)
remote:   ✔ validate   lint               passed
remote:   ✘ test       unit-test          <span class="hl">failed</span>
remote:   – deploy     push-vlans         skipped
remote: Pipeline #102 failed (stage "test") — see: ci log &lt;job&gt;</pre>
<p>Progress: lint is green and the pipeline went further. Now the second mistake shows up, the one that lint could not see. Read the test log:</p>
<pre class="code">ci log unit-test</pre>
<pre class="out">Job "unit-test" (failed)
Running with nk-runner 17.x on shell executor
$ git checkout 6b0032d
$ python3 check.py
Traceback (most recent call last):
  File "check.py", line 10, in &lt;module&gt;
    assert 1 &lt;= v["id"] &lt;= 4094, f"VLAN {v['id']} is out of range 1-4094"
<span class="hl">AssertionError: VLAN 4100 is out of range 1-4094</span>
ERROR: Job failed: command "python3 check.py" exited with a non-zero status</pre>
<p>The last line says what is wrong: VLAN 4100 is not a valid VLAN id. A VLAN id has 12 bits, and 1 to 4094 are usable. The intended guest Wi-Fi VLAN was 40. A single character was mistyped as 4100. Fix it with <code>sed</code>, re-run the test locally, then commit and push:</p>
<pre class="code">sed -i 's/id: 4100/id: 40/' vlans.yml
python3 check.py</pre>
<pre class="out">check OK: <span class="hl">3 VLANs look valid</span></pre>
<pre class="code">git commit -am "Guest Wi-Fi is VLAN 40"
git push origin main</pre>
<pre class="out">[main e314fd1] Guest Wi-Fi is VLAN 40
 1 file changed
remote: Pipeline #103 created for main (e314fd1)
remote:   ✔ validate   lint               passed
remote:   ✔ test       unit-test          passed
remote:   ✔ deploy     push-vlans         passed
remote: Pipeline #103 <span class="hl">passed</span> — see: ci log &lt;job&gt;</pre>
<p>Finally, confirm on the switch. The new VLAN is there:</p>
<pre class="code">enable
show vlan brief</pre>
<pre class="out">VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/1, Gi0/2, Gi0/3
                                                Gi0/4, Gi0/5, Gi0/6, Gi0/7
                                                Gi1/0, Gi1/1, Gi1/2, Gi1/3
                                                Gi1/4, Gi1/5, Gi1/6, Gi1/7
10   POS                              active    
20   STAFF                            active    
<span class="hl">40   GUEST-WIFI                       active    </span>
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>VLAN 40 GUEST-WIFI is active. Two pipelines failed before the switch was touched, so the network never saw a broken change. That is the value of the system.</p>

<h3>A quick table of symptoms</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>First action</th></tr><tr><td>lint failed, "bad indentation"</td><td>wrong number of spaces</td><td>nl FILE; fix the line named</td></tr><tr><td>unit-test failed, AssertionError</td><td>a value breaks a rule</td><td>read the message after AssertionError</td></tr><tr><td>"chosen stage ... does not exist"</td><td>job stage not listed in stages</td><td>compare the job and the stages list</td></tr><tr><td>later jobs skipped</td><td>an earlier job failed</td><td>open the first failed job</td></tr><tr><td>deploy failed, log shows a connection error</td><td>device unreachable or credentials wrong</td><td>test SSH reachability; check the CI variables</td></tr><tr><td>green but device unchanged</td><td>script did nothing or wrong target</td><td>read the job log; verify on the device</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pipeline #101 is red at lint, line 8 column 4. You fix the space, push, and #102 turns red at unit-test: VLAN 4100 is out of range 1-4094. You change it to 40, push, and #103 is green. show vlan brief lists 40 GUEST-WIFI. Two small commits, each with a clear message.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Changing three things at once, so you cannot tell which fixed it. Opening a skipped job and searching for an error that is not there. Editing the switch by hand to "get it working", leaving the repository out of date.</p></div>
<div class="exam"><p><b>Exam trap.</b> Troubleshoot from the first failed stage. A fix for one failure can reveal the next. The usable VLAN id range is 1 to 4094.</p></div>

<div class="scn"><h4>Two failures in a row</h4><p>A junior engineer pushed a fix for a YAML error and, when the pipeline failed again, assumed the fix had not worked. A colleague asked him to read the new log: the pipeline had moved on. The lint job was now green and the test job was red, a different error. He had made progress, not lost it. After the second fix the pipeline went green.</p><p><b>Lesson:</b> a new red job after a fix is usually the next problem, not the same one.</p></div>
<div class="iv"><p class="q">"A pipeline fails. How do you troubleshoot it?"</p><p>I open the pipeline status to find the first failed job, because later jobs are only skipped. I read the end of its log for the error message, and reproduce the command locally. I fix one thing, commit with a clear message, push, and read the new pipeline, since a second problem may appear. I verify on the device after a green deploy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Find the first failed job; skipped jobs are not the problem.</li><li>Read the end of ci log JOB; the error is usually the last lines.</li><li>Reproduce the check locally, fix one thing, push again.</li><li>Lab 2: lint error on line 8 (indentation), then test error VLAN 4100, fixed to 40.</li><li>Verify with show vlan brief after the pipeline turns green.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> red pipeline koi aafat nahi hai. Yeh system apna kaam kar raha hai. <b>Pehla</b> red job dhundo, uska log neeche se padho, ek cheez fix karo, phir push karo. Lab 2 aapko do alag galtiyan deta hai practice ke liye.</p>

<h3>Tareeka</h3>
<ul><li><b>1. Status:</b> <code>ci status</code> chalao aur pehla job dhundo jo green nahi hai. Uske neeche ke skipped jobs nirdosh hain.</li><li><b>2. Log:</b> <code>ci log JOB</code> chalao aur pehle aakhri lines padho. Error lagbhag hamesha end mein hota hai.</li><li><b>3. Reproduce:</b> wahi command laptop par chalao (<code>yamllint vlans.yml</code>, <code>python3 check.py</code>) taaki pipeline ka intezaar kiye bina fix kar sako.</li><li><b>4. Ek cheez fix karo</b>, saaf message ke saath commit karo, push karo.</li><li><b>5. Nayi pipeline padho.</b> Doosri samasya aksar pehli ke peeche chhipi hoti hai.</li></ul>

<h3>Scene: store 14, Indore, guest Wi-Fi chahiye</h3>
<p>Ek colleague ne <code>vlans.yml</code> mein chautha VLAN joda aur push kiya. Pipeline red hai:</p>
<pre class="code">ci status</pre>
<pre class="out">Pipeline #101 <span class="hl">failed</span> on main (7d546f7)
  validate   lint               <span class="hl">failed</span>
  test       unit-test          skipped
  deploy     push-vlans         skipped</pre>
<p>Pehla red job <b>lint</b> hai. Uske neeche ke do skipped hain, jo sahi hai: failure ke baad kuch nahi chalta. Lint ka log kholo:</p>
<pre class="code">ci log lint</pre>
<pre class="out">Job "lint" (failed)
Running with nk-runner 17.x on shell executor
$ git checkout 7d546f7
$ yamllint vlans.yml
<span class="hl">vlans.yml:8:4: error: bad indentation of a sequence entry (this line is indented more than the list item above it)</span>
ERROR: Job failed: command "yamllint vlans.yml" exited with a non-zero status</pre>
<p>Message file, line 8 aur column 4 batata hai. File ko line numbers ke saath print karo:</p>
<pre class="code">nl vlans.yml</pre>
<pre class="out">     1  # VLANs for Narmada Retail - store 14, Indore
     2  vlans:
     3    - id: 10
     4      name: POS
     5    - id: 20
     6      name: STAFF
     7    - id: 4100
     8     name: GUEST-WIFI</pre>
<p>Lines 7 aur 8 dekho. Line 8 ka key <code>name</code> line 7 ke <code>id</code> ke seedh mein hona chahiye, par usme ek space kam hai. Line 8 fix karo (name se pehle chaar spaces) aur local check karo:</p>
<pre class="code">edit vlans.yml 8     name: GUEST-WIFI
yamllint vlans.yml</pre>
<pre class="out">     8      name: GUEST-WIFI
vlans.yml: <span class="hl">valid YAML</span> (mapping with keys: vlans)</pre>
<pre class="code">git commit -am "Fix YAML indentation"
git push origin main</pre>
<pre class="out">[main 6b0032d] Fix YAML indentation
 1 file changed
remote: Pipeline #102 created for main (6b0032d)
remote:   ✔ validate   lint               passed
remote:   ✘ test       unit-test          <span class="hl">failed</span>
remote:   – deploy     push-vlans         skipped
remote: Pipeline #102 failed (stage "test") — see: ci log &lt;job&gt;</pre>
<p>Progress: lint green hai aur pipeline aage gayi. Ab doosri galti dikhi, woh jo lint nahi dekh sakta tha. Test ka log padho:</p>
<pre class="code">ci log unit-test</pre>
<pre class="out">Job "unit-test" (failed)
Running with nk-runner 17.x on shell executor
$ git checkout 6b0032d
$ python3 check.py
Traceback (most recent call last):
  File "check.py", line 10, in &lt;module&gt;
    assert 1 &lt;= v["id"] &lt;= 4094, f"VLAN {v['id']} is out of range 1-4094"
<span class="hl">AssertionError: VLAN 4100 is out of range 1-4094</span>
ERROR: Job failed: command "python3 check.py" exited with a non-zero status</pre>
<p>Aakhri line batati hai kya galat hai: VLAN 4100 valid VLAN id nahi hai. VLAN id 12 bits ka hota hai, aur 1 se 4094 use hote hain. Guest Wi-Fi ka iraada VLAN 40 tha. Ek character galat type ho gaya tha jo 4100 ban gaya. <code>sed</code> se fix karo, test local dobara chalao, phir commit aur push:</p>
<pre class="code">sed -i 's/id: 4100/id: 40/' vlans.yml
python3 check.py</pre>
<pre class="out">check OK: <span class="hl">3 VLANs look valid</span></pre>
<pre class="code">git commit -am "Guest Wi-Fi is VLAN 40"
git push origin main</pre>
<pre class="out">[main e314fd1] Guest Wi-Fi is VLAN 40
 1 file changed
remote: Pipeline #103 created for main (e314fd1)
remote:   ✔ validate   lint               passed
remote:   ✔ test       unit-test          passed
remote:   ✔ deploy     push-vlans         passed
remote: Pipeline #103 <span class="hl">passed</span> — see: ci log &lt;job&gt;</pre>
<p>Aakhir mein switch par confirm karo. Naya VLAN maujood hai:</p>
<pre class="code">enable
show vlan brief</pre>
<pre class="out">VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/1, Gi0/2, Gi0/3
                                                Gi0/4, Gi0/5, Gi0/6, Gi0/7
                                                Gi1/0, Gi1/1, Gi1/2, Gi1/3
                                                Gi1/4, Gi1/5, Gi1/6, Gi1/7
10   POS                              active    
20   STAFF                            active    
<span class="hl">40   GUEST-WIFI                       active    </span>
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>VLAN 40 GUEST-WIFI active hai. Do pipelines switch ko chhune se pehle fail hui, isliye network ne kabhi toota hua change dekha hi nahi. Yahi system ki keemat hai.</p>

<h3>Lakshanon ki ek chhoti table</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Sambhavit wajah</th><th>Pehla kadam</th></tr><tr><td>lint failed, "bad indentation"</td><td>spaces ki galat ginti</td><td>nl FILE; bataayi gayi line fix karo</td></tr><tr><td>unit-test failed, AssertionError</td><td>koi value rule todti hai</td><td>AssertionError ke baad wala message padho</td></tr><tr><td>"chosen stage ... does not exist"</td><td>job ka stage stages mein nahi</td><td>job aur stages list ko milao</td></tr><tr><td>baad ke jobs skipped</td><td>pehle ka job fail hua</td><td>pehla failed job kholo</td></tr><tr><td>deploy failed, log mein connection error</td><td>device unreachable ya credentials galat</td><td>SSH reachability test karo; CI variables dekho</td></tr><tr><td>green par device waisa hi</td><td>script ne kuch nahi kiya ya galat target</td><td>job log padho; device par verify karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pipeline #101 lint par red hai, line 8 column 4. Aap space fix karke push karte ho, aur #102 unit-test par red ho jaati hai: VLAN 4100 is out of range 1-4094. Aap use 40 karke push karte ho, aur #103 green hai. show vlan brief 40 GUEST-WIFI list karta hai. Do chhote commits, har ek saaf message ke saath.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Ek saath teen cheezein badalna, jisse pata nahi chalta kisne fix kiya. Skipped job kholkar aisi error dhundna jo wahan hai hi nahi. Switch par haath se edit karna "chalu karne" ke liye, aur repository ko purana chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pehle failed stage se troubleshoot karo. Ek failure ka fix agli failure khol sakta hai. Usable VLAN id range 1 se 4094 hai.</p></div>

<div class="scn"><h4>Lagataar do failures</h4><p>Ek junior engineer ne YAML error ka fix push kiya aur pipeline dobara fail hui, to usne maan liya ki fix kaam nahi kiya. Colleague ne use naya log padhne ko kaha: pipeline aage badh chuki thi. Lint job ab green tha aur test job red, alag error ke saath. Usne progress ki thi, kuch khoya nahi tha. Doosre fix ke baad pipeline green ho gayi.</p><p><b>Lesson:</b> fix ke baad naya red job aksar agli samasya hai, wahi nahi.</p></div>
<div class="iv"><p class="q">"Pipeline fail ho jaye to troubleshoot kaise karoge?"</p><p>Main pipeline status khol ke pehla failed job dhundta hoon, kyunki baad ke jobs sirf skipped hote hain. Uske log ka end padhta hoon error message ke liye, aur command local chalakar reproduce karta hoon. Ek cheez fix karta hoon, saaf message se commit karta hoon, push karta hoon, aur nayi pipeline padhta hoon kyunki doosri samasya aa sakti hai. Green deploy ke baad device par verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pehla failed job dhundo; skipped jobs samasya nahi hain.</li><li>ci log JOB ka end padho; error aksar aakhri lines mein hota hai.</li><li>Check local reproduce karo, ek cheez fix karo, phir push karo.</li><li>Lab 2: line 8 par lint error (indentation), phir test error VLAN 4100, fix karke 40.</li><li>Pipeline green hone ke baad show vlan brief se verify karo.</li></ul></div>

`}};export{e as default};