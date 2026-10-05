# Algorithms and code: how a rule becomes a result

3.2A–D · pp. 81–85; chapter connections pp. 90–91

## 1. A feed is a sequence of decisions

Imagine a school media feed containing a concert, a science demonstration and a sports update. The phone shows an ordered list, but somebody has decided which information to collect and which outcomes to favour. We will begin with very small rules that we can follow ourselves. Later we will examine recommendation systems and the consequences for people. You do not need programming experience. By the end, you should be able to trace a rule, explain its result and identify a decision hidden inside it.

Practice: Predict one input and one output of the school feed.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 81.

## 2. An algorithm

An algorithm is a procedure. Code is one way to implement that procedure. A rule for finding a book can be written in ordinary language and followed by a person, or expressed in a programming language and run by a computer. The input and output must be clear. An algorithm can have no external input, but it still produces a defined result. When explaining a system, naming an algorithm is only a start. State what information enters, what the procedure does and what comes out.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 81–82.

## 3. Characteristics of a usable algorithm

Compare “show the best video” with “sort by completion rate, then by item ID when values tie.” The first instruction leaves best undefined. The second tells us exactly how to order the available data. A procedure also needs a stopping condition, such as reaching the end of a finite list. Feasible means that its demands fit the resources available. The textbook also describes independence from a particular programming language. These characteristics help us check whether a rule can actually be followed before judging whether its purpose is desirable.

Practice: Repair “keep checking until you find a good item.” Define good and a stopping rule.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 81–82.

## 4. Variables hold values

Use a variable called total to count available school videos. At the start total equals zero. After checking the first item, it may become one. A trace table shows the value after each instruction, so we can find the step where an error happened. A variable does not have to change every time it is used. It is called a variable because its value can vary. A literal value, such as the threshold 10, stays fixed in this example. Always identify what the variable represents and its unit.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 82.

## 5. Conditionals choose a branch

Suppose we include videos lasting at most 60 seconds. An item of exactly 60 seconds passes the condition duration less than or equal to 60. It would fail a condition duration less than 60. This tiny distinction changes an outcome for the creator. A conditional does not guess what to do. It evaluates a stated test. A missing duration needs a separate rule because missing is not the same as zero. The person designing that rule decides whether to exclude the item, request a value or treat the uncertainty in another way.

Practice: What happens to an item lasting exactly 60 seconds? What if duration is missing?

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 83.

## 6. Loops repeat a set of instructions

A loop lets a procedure apply instructions to several records. In a for-each loop, the next record changes each time. If the procedure never moves to the next record, it may fail to terminate. A while loop repeats while a condition remains true, so its instructions must eventually change the condition or provide another exit. On paper, place your finger on the current record and move it only when the loop advances. Record a variable after each pass. This keeps the trace tied to the actual sequence.

Practice: Trace durations 30, 75 and 60. How many items pass?

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 83.

## 7. One procedure, several representations

Read the worked flowchart from top to bottom. The oval starts or ends the procedure, the parallelogram reads input, the diamond tests a condition and the rectangles perform actions. Arrows show sequence. Here a known numeric duration of 60 follows YES to INCLUDE, then STOP. A value of 75 follows NO to EXCLUDE, then STOP. Each representation should describe the same decisions. Natural language is accessible to people who do not code, but vague wording can hide ambiguity. A flowchart makes a branch or return to a previous test visible. Code allows a computer to execute the procedure, but syntax depends on the programming language. Pseudocode is a planning notation that resembles code without requiring one language. When translating, preserve the condition, order and stopping rule. A prettier representation is not an improvement if it changes the procedure.

Practice: Trace the YES and NO paths. Which shape holds the condition? Keep the boundary identical.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 83.

## 8. Algorithm, pseudocode and code

The same algorithm can be implemented in several programming languages. Writing Python does not automatically make the procedure correct. Developers normally specify the task, represent the procedure, implement it and test its behaviour on ordinary and unusual inputs. Boundary and missing values matter. In Digital Society, you need enough precision to explain a mechanism. You are not required to turn every case response into a software tutorial. When a code example appears, read it line by line and connect the values to the people or objects they represent.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 83–84.

## 9. Searching finds a target

Take the list B4, B1, B3, B2 and search for B3. Compare B4 with the target, then B1, then B3. The target appears after three comparisons. Searching for B9 requires all four comparisons and returns no match. This is linear search. Its work grows with the number of records inspected. Other searches use different structures or assumptions. Do not call an algorithm efficient without naming what work you are counting and what input conditions you have assumed.

Practice: Predict the number of comparisons for B2 and for B9 before opening TraceLab.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 84.

## 10. Sorting changes the order

Start with 3, 1, 2 and sort in ascending order. Compare 3 and 1, then swap them because 3 is larger. The list becomes 1, 3, 2. Compare 3 and 2 and swap again. The list becomes 1, 2, 3. In longer lists, another pass may still be needed. A stop rule can end the process after a complete pass with no swaps. Sorting does not make the data more accurate. It orders the values you supplied, including errors. State how ties and missing values are handled.

Practice: Try one pass on 4, 2, 3, 1. Has the whole list finished sorting?

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 84.

## 11. Filtering and counting

Use three library records: A has 10 loans, B has 4 and C has 12. Filtering for at least 10 loans keeps A and C. Counting the matching records gives two. Sorting all records by loans gives C, A, B. These operations answer different questions. A filter can determine whose item is eligible before a ranking rule is applied. A count can become an input to a later decision. Explain the pipeline rather than using search, sort and filter as interchangeable terms.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 84.

## 12. Efficiency needs a measure

Efficiency concerns resources used to perform a task. A linear search can be compared by its number of comparisons on a particular list. A different search may need sorted input, which itself takes work. Timing a program also depends on hardware and implementation. A procedure can be extremely fast while excluding a group unfairly. It can be transparent while using an unsuitable objective. In a judgement, identify the relevant efficiency measure and the social criterion instead of collapsing both into “better”.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 81, 84–86.

## 13. Prioritizing turns a goal into an order

Our invented museum feed has three items. Each has a completion rate c between zero and one and a new-topic flag m, either zero or one. We can favour familiarity or discovery by changing weights. The score is a classroom model, not an actual platform algorithm. The designer has chosen the signals, scale and goal. If two scores tie, item ID will decide their order here. That tie-break is also a design choice. A ranking is an output of these choices, not a direct measurement of quality.

Practice: Which item should lead if discovering an unfamiliar topic is our priority?

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 85.

## 14. A changed objective: prediction

Before calculating, predict which rule is more likely to lift the new-topic item. Rule A gives the flag a contribution of two, while the completion contribution can be at most one. Rule B gives completion up to three, while the flag contributes only point two. Those scales matter. Copy the inputs from the previous slide and calculate all three scores for each rule. Write your prediction before moving on. If your prediction changes, identify which term in the calculation caused it.

Practice: Calculate M1, M2 and M3 for both rules. Record your prediction before revealing the next slide.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 85.

## 15. A changed objective: worked result

For Rule A, M1 scores zero point eight plus two, which equals two point eight. M2 scores zero point nine, and M3 scores zero point five. For Rule B, M1 scores two point four plus point two, or two point six. M2 scores two point seven, and M3 scores one point five. M2 overtakes M1. The arithmetic supports a conclusion about this ranking. It does not measure satisfaction, creator income or actual cultural diversity. Those consequences need further data and evidence. Explain the calculation before discussing a possible stakeholder effect.

Practice: Explain why M2 overtakes M1. Name one outcome this chart cannot establish.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 85.

## 16. Classifying and associating

A priority rule could classify tickets as high, medium or low urgency. An association rule could identify that customers who buy bread also often buy soup. The first assigns a label, while the second describes a relationship in data. A shop might use that association to place items together, but the purchases could reflect weather, promotions or customer habits. The association alone does not establish that buying bread causes soup purchases. These distinctions also matter when a system predicts interests or labels a person as risky.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 85.

## 17. Rules and learned models

Our score formula has explicit weights that we selected. A machine-learning system can instead fit parameters to examples. A neural network is one family of learned models. You do not need its detailed mathematics this week. You do need to explain that people choose the training data, the objective and the measures used to judge success. A learned result does not escape human decisions. We return to model training in chapter 3.6. This slide establishes the connection between data, algorithms and artificial intelligence required by the chapter reflection.

Source: IB Digital Society guide, local April 2026 revision, sections 3.1H, 3.2A–E and 4.2A–D. Assessment authority. Textbook connection: pp. 85, 91.

## 18. The complete decision pipeline

A recommender involves several algorithms and human decisions rather than one magical rule. A system might validate records, remove ineligible items, score the remaining items, sort them and display a selection. The display creates new interactions that can be recorded for later recommendations. A software developer has to implement and test this pipeline. The model can change over time. When explaining a real system, distinguish steps established by a source from steps that you infer or propose. Our simplified model lets us practise tracing, but it does not reveal a platform’s private code.

Practice: Identify where a missing value could change this pipeline.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 84–85, 91.

## 19. Independent transfer: a library queue

Close your notes before trying this changed context. A library has more requests than available copies. It can favour earliest requests, longest waiting time or students whose course requires the book. Choose an objective and describe a finite rule. Do not copy the museum formula without checking whether its inputs make sense. Explain one group that might lose priority and one piece of evidence you would need to judge the result. This is practice for transfer. Your teacher will use your explanation to identify the next teaching step.

Practice: Explain your proposed rule in four sentences. Keep the input, procedure, output and trade-off distinct.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 81–85.

## 20. Chapter 3.2: the knowledge to carry forward

The first half of chapter 3.2 gives us the vocabulary and mechanisms needed for the second half. A strong answer can trace a decision using a specific input, then explain an effect for a stakeholder and judge the rule against a criterion. The next deck teaches bias, human judgement, transparency and accountability. Chapter pages 90 and 91 add HL extension activities, CAS and reflection. This SL route uses the reflection connections but does not assign the HL tasks. Return to a slide you could not explain without notes and try a new example after a delay.

Source: Bomfim et al., Digital Society for the IB Diploma, Hodder, 2022. Printed pages cited per slide. Original paraphrase. Textbook connection: pp. 81–91.